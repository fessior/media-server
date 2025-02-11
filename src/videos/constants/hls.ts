/**
 * Ref: https://www.movavi.com/learning-portal/what-is-video-bitrate.html
 */
export const HLS_RESOLUTIONS = [
  {
    height: 360,
    maxRate: '1125k',
    bufSize: '2250k',
    audioBitrate: '48k',
  },
  {
    height: 480,
    maxRate: '1500k',
    bufSize: '3000k',
    audioBitrate: '64k',
  },
  {
    height: 720,
    maxRate: '3750k',
    bufSize: '7500k',
    audioBitrate: '96k',
  },
  {
    height: 1080,
    maxRate: '6750k',
    bufSize: '13500k',
    audioBitrate: '128k',
  },
];
