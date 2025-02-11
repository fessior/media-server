/**
 * Ref: https://www.movavi.com/learning-portal/what-is-video-bitrate.html
 */
export const HLS_RESOLUTIONS = [
  {
    height: 360,
    fps30Bitrate: '800k',
    fps60Bitrate: '1500k',
    audioBitrate: '64k',
  },
  {
    height: 480,
    fps30Bitrate: '2000k',
    fps60Bitrate: '4000k',
    audioBitrate: '96k',
  },
  {
    height: 720,
    fps30Bitrate: '4000k',
    fps60Bitrate: '7500k',
    audioBitrate: '96k',
  },
  {
    height: 1080,
    fps30Bitrate: '6000k',
    fps60Bitrate: '12000k',
    audioBitrate: '160k',
  },
];
