#ifndef STREAM_INCLUDE_STREAM_H
#define STREAM_INCLUDE_STREAM_H

#include "stream_types.h"
namespace StreamPalm {

class PALM_DLL Stream {
 public:
  virtual ~Stream() = default;
  /**
   * Start the stream.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int Start() = 0;

  /**
   * Stop the stream.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int Stop() = 0;

  /**
   * Get frames data and information.
   *
   * @param[out] frames Frames data and information.
   *
   * @param[in] timeout Timeout in milliseconds.
   *
   * @return void
   */
  virtual int GetFrames(StreamPalmFrames& frames, uint32_t timeout = -1) = 0;

  /**
   * Register frames callback.
   *
   * @param[in] cb Pointer to the callback function.
   *
   * @return void
   */
  virtual void RegisterFrameCb(std::function<int(StreamPalmFrames&)> cb) = 0;
};
}  // namespace StreamPalm

#endif  // STREAM_INCLUDE_STREAM_H
