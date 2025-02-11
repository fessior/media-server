/**
 * Ref: https://www.movavi.com/learning-portal/what-is-video-bitrate.html
 */
export const HLS_RESOLUTIONS = [
  {
    height: 360,

    maxRate: '800k',
    bufSize: '1600k',

    audioBitrate: '32k',
  },
  {
    height: 480,

    maxRate: '1500k',
    bufSize: '3000k',

    audioBitrate: '48k',
  },
  {
    height: 720,

    maxRate: '3000k',
    bufSize: '6000k',

    audioBitrate: '64k',
  },
  {
    height: 1080,

    maxRate: '6000k',
    bufSize: '12000k',

    audioBitrate: '96k',
  },
];
