#ifndef STREAM_INCLUDE_STREAM_TYPES_H_
#define STREAM_INCLUDE_STREAM_TYPES_H_

#include <cstring>
#include <functional>
#include <memory>
#include <vector>
#include "common_types.h"

namespace StreamPalm {

using ProgressHandler = std::function<void(int)>;
using UpgradeReadyHandler = std::function<void()>;
using HeartbeatResult = std::function<void(int)>;

enum RecognizeMode { kRegIrVSIr = 1, kRegIrVSRgb, kRegRgbVSIr, kRegRgbVSRgb, kBiModal };
struct HeartbeatParam {
  uint32_t timeout{500};
  uint32_t allowable_failures_counts{4};
};

enum StreamType {
  kInvalidStreamType = 0,
  kRgb = 1,
  kIr = 2,
  kRgbIr = 5,
};

struct DeviceDescription {
  std::string device_name;           // device name
  std::string serial_num;            // serial number
  std::string stream_sdk_version;    // stream sdk version
  std::string palm_sdk_version;      // palm sdk version
  std::string rgb_firmware_version;  // rgb firmware version
  std::string ir_firmware_version;   // ir firmware version
  uint16_t pid;                      // device pid
  uint16_t vid;                      // device vid
};

typedef enum TemperatureType {
  kTemperatureCamera = 1,
  kTemperatureVcsel,
  kTemperatureCpu,
} TemperatureType;

struct CameraParam {  // Camera intrinsic parameters
  float cx;           // Principal point in image, x
  float cy;           // Principal point in image, y
  float fx;           // Focal length x
  float fy;           // Focal length y
};

struct Bbox {
  int16_t x = 0;
  int16_t y = 0;
  int16_t w = 0;
  int16_t h = 0;
};

struct FaceInfo {
  Bbox bbox;
  struct Point {
    float x = 0.0f;
    float y = 0.0f;
  } face5p[5];
};

template<class T>
struct ImuInfo {
  ImuData<T> imu_data;
  int16_t temperature;
  ImuInfo() = default;
  ImuInfo(uint64_t timestmp, T gyro_x, T gyro_y, T gyro_z, T acce_x, T acce_y, T acce_z) :
      imu_data(timestmp, gyro_x, gyro_y, gyro_z, acce_x, acce_y, acce_z) {}
};

enum LedMode {
  LED_OFF_MODE = 0,
  LED_RED_MODE,         // 红常亮   6
  LED_GREEN_MODE,       // 绿常亮
  LED_BLUE_MODE,        // 蓝常亮
  LED_RED_GREEN_MODE,   // 黄常亮
  LED_RED_BLUE_MODE,    // 紫常亮
  LED_GREEN_BLUE_MODE,  // 青常亮

  LED_RED_BLINK_MODE,         // 红闪烁  6-0
  LED_GREEN_BLINK_MODE,       // 绿闪烁
  LED_BLUE_BLINK_MODE,        // 蓝闪烁
  LED_RED_GREEN_BLINK_MODE,   // 黄闪烁
  LED_RED_BLUE_BLINK_MODE,    // 紫闪烁
  LED_GREEN_BLUE_BLINK_MODE,  // 青闪烁

  LED_RED_BREATH_MODE,         // 红呼吸
  LED_GREEN_BREATH_MODE,       // 绿呼吸
  LED_BLUE_BREATH_MODE,        // 蓝呼吸
  LED_RED_GREEN_BREATH_MODE,   // 黄呼吸
  LED_RED_BLUE_BREATH_MODE,    // 紫呼吸
  LED_GREEN_BLUE_BREATH_MODE,  // 青呼吸

  LED_WHITE_MODE,      // 白常亮
  LED_STANDBY_MODE,    // 基于psensor  蓝呼吸+白常亮+黄闪烁
  LED_RED_LOW_MODE,    // 红弱常亮
  LED_GREEN_LOW_MODE,  // 绿弱常亮
  LED_BLUE_LOW_MODE,   // 蓝弱常亮

  LED_MAX_MODE = LED_BLUE_LOW_MODE,
};

#define ROI_MINIMUM_WxH_RANGE 3340

struct CaptureResult {
  /// Pointer to the RGB image frame.
  std::shared_ptr<Frame> img_rgb;

  /// Pointer to the IR image frame.
  std::shared_ptr<Frame> img_ir;

  /// Pointer to the depth image frame.
  std::shared_ptr<Frame> img_depth;
};

using CaptureCallback = std::function<void(const CaptureResult&)>;
using UpgradeCallback = std::function<void()>;
using ProgressCallback = std::function<void(int)>;

enum LightMode {
  kPalmLightGreenMode = 0,
  kPalmLightBlueMode,
};

enum EventType {
  kTemperatureTooLow = 1,
  kTemperatureTooHigh = 2,
  kLitePsensorEnableError,
  kLitePsensorHardwareError,
  kLitePsensorFaceError,
  kLitePsensorDistanceError,
  kLitePsensorDistanceNormal,
  kLitePsensorClosed,

  kLitePsensorFaceErrCount,
  // kLiteUpgradeEvent,
  // kLiteReportDoe,
  kLiteReportRgbScanFace,
  kLiteReportRgbScanCode,
  kLiteReportDepth,
  kLiteReportFlood,
  kLiteReportSpeckle,
  kLiteReportFaceDetect,

  kPalmReportWorkRgbSensor,
  kPalmReportWorkIrSensor,
  kPalmReportInitRgbSensor,
  kPalmReportInitIrSensor,
  kPalmReportInitAw21036,
  kPalmReportWorkAw21036,
  kPalmReportInitMp3336,
  kPalmReportWorkMp3336,
  kPalmReportInitPsenosrUpperLeft,
  kPalmReportInitPsenosrUpperRight,
  kPalmReportInitPsenosrLowerLeft,
  kPalmReportInitPsenosrLowerRight,
  kPalmReportWorkerPsenosrUpperLeft,
  kPalmReportWorkerPsenosrUpperRight,
  kPalmReportWorkerPsenosrLowerLeft,
  kPalmReportWorkerPsenosrLowerRight,

  kEventCounts,
};

using EventNotifyHandler = std::function<void(EventType, int32_t event_value)>;
using EventHandler = std::function<void(int32_t event_value)>;

enum StreamErrorCode {
  kOk = 0,
  kUnknownError = 0x1,
  kNotImplemented = 0x2,
  kInvalidArguments = 0x3,
  kNotSupported = 0x4,
  kFailedToAllocateMemory = 0x5,
  kTransferFailed = 0x20010,
  kConfigFileNotExist = 0x20012,
  kFailedToFindDevices = 0x21001,
  kAccessToNullPointer = 0x21002,
  kFailedToOpenCamera = 0x21003,
  kFailedToCloseCamera = 0x21004,
  kFailedToStartStream = 0x21005,
  kFailedToSetOrGetData = 0x21006,
  kFailedToCheckData = 0x21007,
  kFailedToOpenIrCamera = 0x21008,
  kFailedToOpenRgbCamera = 0x21009,
  kFailedToOperateUsbSerial = 0x2100A,
  kCameraNotRunning = 0x2100B,
  kCameraNotOpened = 0x2100C,
  kFailedToFindDriver = 0x2100D,
  kCameraNotConfigured = 0x2100E,
  kFailedToStoptStream = 0x2100F,
  kDataSizeError = 0x22001,
  kDataNotReady = 0x22002,
  kUnsupportedCameraMode = 0x22004,
  kTimeout = 0x22010,
  kScanModeNotSet = 0x22011,
  kFileNotExist = 0x22100,
  kFailedToOperateFile = 0x22101,
  kFailedToMatchRgbData = 0x22102,
  kUpgradeVersionNotChanged = 0x22103,
  kDeviceIsUpgrading = 0x22104,
  kFailedToUpgrade = 0x22105,
  kFailedToSetExposure = 0x22106,
  kFailedToGetExposure = 0x22107,

  kFailedToInitFaceAlgorithm = 0x23001,
  kFailedToInitDepthAlgorithm = 0x23002,
  kInvalidCalibrationSize = 0x23003,
  kFailedToReadFlash = 0x23004,
  kFailedToGetCalibration = 0x23005,
  kInvalidPath = 0x23006,
  kErrorOccured = 0x23007,
  kFailedToGetLicense = 0x23008,
  kFailedToInitPalmAlgorithm = 0x23009,

  kNoSuchCameraComponent = 0x24001,
  kFailedToGetPreviewFrame = 0x24002,
  kFailedToGetIRframe = 0x24003,
  kFaceCapturing = 0x24004,
  kPreviewOpenFailed = 0x24005,
  KPreviewReadFaided = 0x24006,

  kAlgorithmNotInitialized = 0x25001,
  kStreamNotStarted = 0x25002,
  kDeviceHasOpened = 0x25003,
  kDeviceNotInitialized = 0x25004,
  kDeviceNotInCaptureMode = 0x25005,
  kInvalidFrameFormat = 0x25006

};

typedef struct CameraTemperature {
  float temperature_main_board;
  float temperature_led_board;
  float temperature_cpu;
  float temperature_rgb_sensor;
} CameraTemperature;

struct StreamDeviceVersionInfo {
  Version camera_sdk_version;    // Camera library version
  Version ir_firmware_version;   // Ir camera firmware version
  Version rgb_firmware_version;  // Rgb camera firmware version
  std::string kernel_version;    // Kernel version
  Version calib_version;         // Calibration version
  Version depth_version;         // Depth algorithm library version
};

struct LightInfo {
  uint8_t light_mode{0xff};
  uint8_t light_color{0xff};
  uint16_t ir_current{0};
};

enum class HintMap {
  kTooClose = 0x1,
  kFaceTooSmall = 0x2,
  kNotCenteredX = 0x4,
  kNotCenteredY = 0x8,
  kAngled = 0x10,
  kCovered = 0x20,
  kMasked = 0x40,
  kIrLiveness = 0x80,
  k3DLiveness = 0x100,
  kBadExpression = 0x200,
  kBlurred = 0x400,  // above match usb serial protocol
  kNeedAe = 0x800,
  kNoFace = 0x1000,
  kk3DLivenessAndMouthMask = 0x2000,
};

struct BBox {
  uint16_t x;  // X coordinate of the top-left corner
  uint16_t y;  // Y coordinate of the top-left corner
  uint16_t w;  // Width of the bounding box
  uint16_t h;  // Height of the bounding box
};

struct StreamData {
  size_t data_len = 0;            // data_len
  std::shared_ptr<uint8_t> data;  // data
};

struct ExtraFrameInfo {
  /*veinshine01*/
  uint16_t psensor_value[4]{0};
  uint32_t PalmRoi[4]{0};
  int light_mode;
};

struct StreamPalmFrame {
  int index;                   // Index of the frame
  int size;                    // Frame data size in bytes
  int cols;                    // Number of columns
  int rows;                    // Number of rows
  int bits_per_pixel;          // Number of bits per pixel
  float temperature;           // Driver temperature during this frame
  FrameType frame_type;        // Type of the frame, refer to FrameType
  ImageFormat image_format;    // Format of the image
  uint64_t timestamp;          // Timestamp of the frame
  std::shared_ptr<void> data;  // Pointer to the frame data
};

struct StreamPalmFrames {
  int count;                                                // Number of frames
  std::vector<std::shared_ptr<StreamPalmFrame>> frame_ptr;  // Pointer to the frames array
  std::shared_ptr<ExtraFrameInfo> extra_info{};             // Extra frames information
};

}  // namespace StreamPalm

#endif  // STREAM_INCLUDE_STREAM_TYPES_H_
