#ifndef STREAM_INCLUDE_ARITHMETIC_DEVICE_H_
#define STREAM_INCLUDE_ARITHMETIC_DEVICE_H_

#include "device.h"
namespace StreamPalm {

class PALM_DLL ArithmeticDevice : virtual public Device {
 public:
  /**
   * Enable DimPalm arithmetic.
   *
   * @param[in] enable enable_dim_palm.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int EnableDimPalm(bool enable) = 0;

  /**
   * Save Pictures.
   *
   * @param[in] path save picture path.
   *
   * @param[in] num save picture num.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int StartSavePictures(const std::string& path, int num) = 0;

  /**
   * Stop Save Pictures.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int StopSavePictures() = 0;

  /**
   * Set the palm_model path.
   *
   * @param[in] path palm_model path.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int SetPalmModelPath(const std::string& path = "") = 0;

  /**
   * Write License
   *
   * @param[in] license  license.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int WriteLicense(const std::string& license) = 0;

  /**
   * Read License
   *
   * @param[out] license  license.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int ReadLicense(std::string& license) = 0;
};
}  // namespace StreamPalm
#endif
