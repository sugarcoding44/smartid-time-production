#ifndef PALM_CLIENT_H_
#define PALM_CLIENT_H_

#include "palm_arithmetic.h"

namespace StreamPalm {

class PALM_DLL PalmClient {
 public:
  virtual ~PalmClient() = default;

  /**
   * Create a palm object to operate the following interface.
   *
   * @param[out] client client object.
   *
   * @param[in] palm palm arithmetic object.
   *
   * @param[in] company_id  the company index.
   *
   * @param[in] sn  the sn/uid of the palm device.
   *
   * @param[in] ip  ip address of remote server.
   *
   * @param[in] port port of remote server.
   *
   * @param[in] host_name host name.
   *
   * @return Zero on success, error code otherwise.
   */

  static int CreatePalmClient(std::shared_ptr<PalmClient>* client,
                              std::shared_ptr<PalmCapture> palm,
                              std::string& error_string,
                              const std::string& company_id,
                              const std::string& sn,
                              const std::string& ip,
                              const std::string& port,
                              const std::string& host_name = "");

  /**
   * Register.
   *
   * @param[in] palm_rgb_img palm rgb img.
   *
   * @param[in] palm_ir_img  palm ir img.
   *
   * @param[in] rgb_features  rgb features.
   *
   * @param[in] ir_features  ir features.
   *
   * @param[out] features_id  features id.
   *
   * @param[out] error_string  error string.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int RegisterToServer(const Frame& palm_rgb_img,
                               const Frame& palm_ir_img,
                               const std::vector<float>& rgb_features,
                               const std::vector<float>& ir_features,
                               int& features_id,
                               std::string& error_string) = 0;

  /**
   * Delete the specified feature value ID from the server.
   *
   * @param[in] features_id features id.
   *
   * @param[in] error_string error string.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int DeleteID(const int& features_id, std::string& error_string) = 0;

  /**
   * Query.
   *
   * @param[in] palm_rgb_img palm rgb img.
   *
   * @param[in] palm_ir_img  palm ir img.
   *
   * @param[in] rgb_features  rgb features.
   *
   * @param[in] ir_features  ir features.
   *
   * @param[out] features_id  features id.
   *
   * @param[out] error_string  error string.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int QueryFeaturesIdFromServer(const Frame& palm_rgb_img,
                                        const Frame& palm_ir_img,
                                        const std::vector<float>& rgb_features,
                                        const std::vector<float>& ir_features,
                                        int& features_id,
                                        std::string& error_string) = 0;

  /**
   * GetLicense.
   *
   * @param[out] license license.
   *
   * @param[out] error_string  error string.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetLicenseFromServer(std::string& license, std::string& error_string) = 0;
};

}  // namespace StreamPalm
#endif  // PALM_CLIENT_H_
