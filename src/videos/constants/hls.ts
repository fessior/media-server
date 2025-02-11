/**
 * Ref: https://www.movavi.com/learning-portal/what-is-video-bitrate.html
 */
export const HLS_RESOLUTIONS = [
  {
    height: 360,
    fps30Bitrate: '600k',
    fps60Bitrate: '1000k',
    audioBitrate: '64k',
  },
  {
    height: 480,
    fps30Bitrate: '1200k',
    fps60Bitrate: '2000k',
    audioBitrate: '96k',
  },
  {
    height: 720,
    fps30Bitrate: '2500k',
    fps60Bitrate: '4500k',
    audioBitrate: '96k',
  },
  {
    height: 1080,
    fps30Bitrate: '4000k',
    fps60Bitrate: '6500k',
    audioBitrate: '160k',
  },
];
