/**
 * Ref: https://www.movavi.com/learning-portal/what-is-video-bitrate.html
 */
export const HLS_RESOLUTIONS = [
  // {
  //   height: 360,
  //   maxRate: '1000k',
  //   bufSize: '2000k',
  //   audioBitrate: '64k',
  // },
  {
    height: 480,
    maxRate: '1500k',
    bufSize: '3000k',
    audioBitrate: '96k',
  },
  {
    height: 720,
    maxRate: '3500k',
    bufSize: '7000k',
    audioBitrate: '96k',
  },
  // {
  //   height: 1080,
  //   maxRate: '6000k',
  //   bufSize: '12000k',
  //   audioBitrate: '128k',
  // },
];
