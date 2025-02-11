/**
 * Ref: https://www.movavi.com/learning-portal/what-is-video-bitrate.html
 */
export const HLS_RESOLUTIONS = [
  {
    height: 360,

    maxRate: '1200k',
    bufSize: '2400k',

    audioBitrate: '48k',
  },
  {
    height: 480,

    maxRate: '2000k',
    bufSize: '4000k',

    audioBitrate: '64k',
  },
  {
    height: 720,

    maxRate: '4000k',
    bufSize: '8000k',

    audioBitrate: '80k',
  },
  {
    height: 1080,

    maxRate: '8000k',
    bufSize: '16000k',

    audioBitrate: '128k',
  },
];
