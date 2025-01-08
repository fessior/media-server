/**
 * Ref: https://www.movavi.com/learning-portal/what-is-video-bitrate.html
 */
export const HLS_RESOLUTIONS = [
  {
    height: 360,
    fps30Bitrate: '1000k',
    fps60Bitrate: '1500k',
    audioBitrate: '96k',
  },
  {
    height: 480,
    fps30Bitrate: '2500k',
    fps60Bitrate: '4000k',
    audioBitrate: '128k',
  },
  {
    height: 720,
    fps30Bitrate: '5000k',
    fps60Bitrate: '7500k',
    audioBitrate: '128k',
  },
  {
    height: 1080,
    fps30Bitrate: '8000k',
    fps60Bitrate: '12000k',
    audioBitrate: '192k',
  },
  {
    height: 1440,
    fps30Bitrate: '16000k',
    fps60Bitrate: '24000k',
    audioBitrate: '192k',
  },
  {
    height: 2160,
    fps30Bitrate: '35000k',
    fps60Bitrate: '53000k',
    audioBitrate: '192k',
  },
];
