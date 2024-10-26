const create = (src: string, factor: number) => {
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "auto";
    video.playbackRate = factor;

    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";

    const rate = 25;
    const frameDuration = factor / rate;

    // Handler for snapping the time
    const snapTimeHandler = () => {
      console.log(`Current time: ${video.currentTime}`);
      const bottomOfFrame =
        Math.floor(video.currentTime / frameDuration) * frameDuration;
      const targetTime = bottomOfFrame + frameDuration / 2;
      console.log(`Target time: ${targetTime}`);
      const difference = Math.abs(video.currentTime - targetTime);
      console.log(`Difference: ${difference}`);
      if (difference <= 0.01) {
        console.log(`No difference`);
        return;
      }
      video.currentTime = targetTime;
    };

    video.addEventListener("seeked", snapTimeHandler);
    video.addEventListener("pause", snapTimeHandler);


    video.appendChild(source);
    document.body.appendChild(video);
    return video;
};

const metadata = (video: HTMLVideoElement) => {
    const promise = new Promise(resolve => {
        video.requestVideoFrameCallback((now, metadata) => {
            resolve(metadata);
        })
    });
    if (video.paused) video.currentTime += Number.EPSILON;
    return promise;
};

const frame = (video: HTMLVideoElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("2d context not supported");
    
    context.drawImage(video, 0, 0);
    return Array.from(context.getImageData(0, 0, canvas.width, canvas.height).data);
};

document.addEventListener("DOMContentLoaded", () => {
    const query = new URLSearchParams(window.location.search);
    const src = query.get("src");
    const factor = query.get("factor");
    if (!src) return;

    const video = create(src, factor ? parseInt(factor) : 1);
    (window as any).test = { metadata: () => metadata(video), frame: () => frame(video) };
});
