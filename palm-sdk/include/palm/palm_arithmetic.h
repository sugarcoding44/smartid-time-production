#ifndef STREAM_INCLUDE_PALM_ARITHMETIC_H_
#define STREAM_INCLUDE_PALM_ARITHMETIC_H_

#include <map>
#include "device.h"
#include "stream_types.h"

namespace StreamPalm {
enum PalmDetectResult {
  kDimResultPalmNoDetected = -1,
  kDimResultSuccess,
  kDimResultBigPose,
  kDimResultQualityError,
  kDimResultRegisterQualityError,
  kDimResultLivenessError,
  kDimResultMouthMask,
  kDimResultIrDarkness,
  kDimResultIrOverexpose,
  kDimResultRGBDarkness,
  kDimResultRGBOverexpose,
  kDimResultRegisterIrDarkness,
  kDimResultRegisterIrOverexpose,
  kDimResultRegisterRGBDarkness,
  kDimResultRegisterRGBOverexpose,
  kDimResultLivenessColorGrayError,
  kDimResultReliabilityIrError,
  kDimResultReliabilityRgbError,
  kDimResultRegisterReliabilityIrError,
  kDimResultRegisterReliabilityRgbError,
  kDimResultAEIrDarkness,
  kDimResultAEIrOverexpose,
  kDimResultAERGBDarkness,
  kDimResultAERGBOverexpose,
  kDimResultUnexpectedCenterBoxPos,
  kDimResultIllegalEnv,
  kDimResultPalmIsMoving,
};

static std::map<PalmDetectResult, std::string> ErrorMsg = {
    {kDimResultSuccess, "刷掌成功"},
    {kDimResultBigPose, ""},
    {kDimResultQualityError, "请将掌心面向镜头"},
    {kDimResultRegisterQualityError, "请张开并摆正手掌"},
    {kDimResultLivenessError, "请将掌心面向镜头"},
    {kDimResultMouthMask, ""},
    {kDimResultIrDarkness, "手掌稍微靠近点"},
    {kDimResultIrOverexpose, "手掌稍微远离点"},
    {kDimResultRGBDarkness, "手掌稍微靠近点"},
    {kDimResultRGBOverexpose, "手掌稍微远离点"},
    {kDimResultRegisterIrDarkness, "手掌稍微靠近点"},
    {kDimResultRegisterIrOverexpose, "手掌稍微远离点"},
    {kDimResultRegisterRGBDarkness, "手掌稍微靠近点"},
    {kDimResultRegisterRGBOverexpose, "手掌稍微远离点"},
    {kDimResultLivenessColorGrayError, "请将掌心面向镜头"},
    {kDimResultReliabilityIrError, "请确保手掌清晰无异常"},
    {kDimResultReliabilityRgbError, "请确保手掌清晰无异常"},
    {kDimResultRegisterReliabilityIrError, "请确保手掌清晰无异常"},
    {kDimResultRegisterReliabilityRgbError, "请确保手掌清晰无异常"},
    {kDimResultAEIrDarkness, ""},
    {kDimResultAEIrOverexpose, ""},
    {kDimResultAERGBDarkness, ""},
    {kDimResultAERGBOverexpose, ""},
    {kDimResultUnexpectedCenterBoxPos, "手掌请位于画面中心"},
    {kDimResultIllegalEnv, ""},
    {kDimResultPalmIsMoving, "手掌请保持静止"},
    {kDimResultPalmNoDetected, "没有检测到手掌"}};

enum class PalmDetectStatus {
  kPalmDetected = 0,  // A palm (either live or not) is detected.
  kNoPalmDetected,    // No palm is detected.
  kManualStop,        // StopPalmCapture() is invoked.
  kTimeout,           // Timeout limit is reached.
  kInitializing,      // Initializing ,please try again later.
};

struct CapturePalmResult {
  // Status of the palm detect handler.
  PalmDetectStatus capture_handler_status;

  // A bitmap recording the errors on palm detection.
  uint32_t live_palm_errors;

  // Pointer to the RGB image frame.
  std::shared_ptr<Frame> img_rgb;

  // Pointer to the IR image frame.
  std::shared_ptr<Frame> img_ir;

  // Features of the detected palm represented in a bit array.
  StreamData ir_features;

  StreamData rgb_features;

  // Skeleton of the detected palm represented in a bit array.
  StreamData skeleton;

  // Palm bounding box within the frame.
  BBox palm_bbox;

  // Palm center bbox
  BBox palm_center_bbox;

  // Palm score.
  float score;

  // psensor value [4]
  int16_t psensor_value[4];

  // Pointer to the debug data (for internal use only).
  // nullptr by default.
  std::shared_ptr<void> debug_info;

  // 0:left_palm 1:right_palm
  int palm_type;

  // rgb ir light info
  LightInfo light_info;

  // Status of the palm detect result.
  PalmDetectResult palm_detect_result{kDimResultPalmNoDetected};
};

using CapturePalmCallback = std::function<void(const CapturePalmResult&)>;

class PALM_DLL PalmCapture {
 public:
  virtual ~PalmCapture() = default;

  /**
   * Create a palm object to operate the following interface.
   *
   * @param[in] device Device object.
   *   *
   * @param[out] palm shared_ptr point to Object PalmCapture.
   *
   * @return Zero on success, error code otherwise.
   */
  static int Create(std::shared_ptr<Device> device, std::shared_ptr<PalmCapture>* palm);

  /**
   * Capture live palm once.
   *
   * This method attempts to capture a live palm until success or timeout.
   * An invocation to StopPalmCapture() stops the capture process.
   * The callback handler is invoked for every frame inspected whether a live palm is present or
   * not.
   *
   * @param[in] capture_handler callback handler to process the detected live palm or detection
   *
   * @param[in] timeout_ms timeout limit in milliseconds. Zero denotes no timeout, i.e. retry until
   * a live palm is captured.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int CapturePalmOnce(CapturePalmCallback capture_handler, uint32_t timeout_ms = 0) = 0;

  /**
   * Capture live palm continuously until timeout or StopPalmCapture() is invoked.
   *
   * This method attempts to capture a live palm until success or timeout.
   * An invocation to StopPalmCapture() stops the capture process.
   * The callback handler is invoked for every frame inspected whether a live palm is present or
   * not.
   *
   * @param[in] capture_handler callback handler to process the detected live palm or detection
   *
   * @param[in] timeout_ms timeout limit in milliseconds.Zero denotes no timeout, i.e. retry until a
   * live palm is captured.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int StartPalmCapture(CapturePalmCallback capture_handler, uint32_t timeout_ms = 0) = 0;

  /**
   * Stop live palm capture.
   *
   * This is a synchronous method, i.e. it will not return until the capture process is stopped
   * completely.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int StopPalmCapture() = 0;

  /**
   * Get the Algorithm Version.
   *
   * @param[out] version.Algorithm version.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetAlgorithmVersion(std::string& version) = 0;

  /**
   * Extraction of palm feature images.
   *
   * @param[out] result result
   *
   * @param[out] score score
   *
   * @param[out] ir_features IR feature vector
   *
   * @param[out] rgb_features RGB feature vector
   *
   * @param[out] skeleton the skeleton of plam
   *
   * @param[out] palm_type 0:right_palm 1:left_palm
   *
   * @param[in] recog_mode recog mode
   *
   * @param[in] palm_ir_img palm ir img
   *
   * @param[in] palm_rgb_img palm rgb img
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int ExtractPalmFeaturesFromImg(int& result,
                                         float& score,
                                         std::vector<float>& ir_features,
                                         std::vector<float>& rgb_features,
                                         std::vector<float>& skeleton,
                                         int& palm_type,
                                         RecognizeMode recog_mode,
                                         const Frame& palm_ir_img,
                                         const Frame& palm_rgb_img) = 0;

  /**
   * Register Palm
   *
   * @param[out] result the result of palm status
   *
   * @param[out] score the score of palm status
   *
   * @param[out] hash_ir_output hash_ir_output
   *
   * @param[out] hash_rgb_output hash_rgb_output
   *
   * @param[out] ir_features the result of palm ir_features
   *
   * @param[out] rgb_features the result of palm rgb_features
   *
   * @param[out] skeleton the skeleton of plam
   *
   * @param[out] palm_type 0: left palm, 1: right palm
   *
   * @param[out] palm_box palm_box
   *
   * @param[out] palm_center_box palm center ROI
   *
   * @param[in] recog_mode the mode of recognition
   *
   * @param[in] palm_ir_img the input of ir image
   *
   * @param[in] palm_rgb_img the input of speckle image
   *
   * @param[in] register_info other register infomation
   *
   * @param[in] hash_ir_input hash_ir_input
   *
   * @param[in] hash_rgb_input hash_rgb_input
   *
   */

  virtual int RegisterPalm(int& result,
                           float& score,
                           std::string& hash_ir_output,
                           std::string& hash_rgb_output,
                           std::vector<float>& ir_features,
                           std::vector<float>& rgb_features,
                           std::vector<float>& skeleton,
                           int& palm_type,
                           std::array<int, 4>& palm_box,
                           std::array<int, 4>& palm_center_box,
                           RecognizeMode recog_mode,
                           const Frame& palm_ir_img,
                           const Frame& palm_rgb_img,
                           std::shared_ptr<ExtraFrameInfo> register_info = nullptr,
                           std::string hash_ir_input = "",
                           std::string hash_rgb_input = "") = 0;

  /**
   * Get Recognition Threshold
   *
   * @param[out] ir_threshold  the ir threshold for recognition feature comparison.
   *
   * @param[out] rgb_threshold  the rgb threshold for recognition feature comparison.
   *
   * @param[in] recog_mode  specify the used recognition mode.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetRecognitionThreshold(float& ir_threshold,
                                      float& rgb_threshold,
                                      RecognizeMode recog_mode) = 0;
};

}  // namespace StreamPalm
#endif  // STREAM_INCLUDE_PALM_ARITHMETIC_H_
