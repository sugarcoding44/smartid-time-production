#ifndef STREAM_INCLUDE_DEVICE_H_
#define STREAM_INCLUDE_DEVICE_H_

#include "stream.h"

namespace StreamPalm {

class PALM_DLL Device {
 public:
  virtual ~Device() = default;
#ifndef __ANDROID__
  /**
   * Record the sdk log to a specific directory when it is enable.
   *
   * @param[in] path Storage path of the sdk log.
   *
   * @param[in] enable True:turn on, false:turn off.
   *
   * @return void
   */
  virtual void EnableLogging(const std::string& path, bool enable) = 0;
#endif

  /**
   * Open device in configed frame mode.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int Open() = 0;

  /**
   * Close device.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int Close() = 0;

  /**
   * Get the serial number of the device.
   *
   * @param[out] sn Serial number of the device.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetSerialNumber(std::string& sn) = 0;

  /*
   * Get the intrinsic and extrinsic parameters of camera.
   *
   * @param[out] ir_intrinsic Intrinsic parameters of ir camera.
   *
   * @param[out] rgb_intrinsic Intrinsic parameters of rgb camera.
   *
   * @param[out] extrinsic Extrinsic parameters of the cameras.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetCameraParameters(Intrinsic& ir_intrinsic,
                                  Intrinsic& rgb_intrinsic,
                                  Extrinsic& extrinsic) = 0;

  /*--------------------stream-------------------*/
  /**
   * Create a stream according to the stream type.
   *
   * @param[out] stream Secondary pointer to the stream object to be created.
   *
   * @param[in]  type Type of the stream, reference to StreamType.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int CreateStream(Stream*& stream, const StreamType type) = 0;

  /**
   * Destroy a stream.
   *
   * @param[in] stream Pointer to the stream object to be destroyed.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int DestroyStream(Stream*& stream) = 0;

  /**
   * Check the device status, opened or not.
   *
   * @return Bool true: opened, false: closed.
   */
  virtual bool IsDeviceOpened() = 0;

  /**
   * Get the supported stream type of the device.
   *
   * @param[out] stream_type Stream type supported by the device.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetSupportedStreamType(std::vector<StreamType>& device_streamtype_vec) = 0;

  /**
   * Get device information.
   *
   * @param[out] device_info Device information
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetDeviceInfo(DeviceDescription& device_info) = 0;

  /**
   * Set p-sensor near and far threshold.
   *
   * @param[in] near_threshold Near threshold, All psensor distances below this threshold are
   * considered to be too close to the palm.
   *
   * @param[in] remote_threshold remote threshold, All psensor distances greater than this threshold
   * are considered to be too far from the palm.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int SetPsensorDistanceThreshold(int32_t near_threshold, int32_t remote_threshold) = 0;

  /**
   * Reboot the device.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int Reboot() = 0;

  /**
   * Set Led mode.
   *
   * @param[in] led_mode led mode.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int SetLedMode(LedMode led_mode) = 0;

  /**
   * Upgrade device firmware.
   *
   * @param[in] file_path Path to store the upgrade files.
   *
   * @param[in] progress_callback Upgrade progress callback
   *
   * @param[in] event_handler Event callback
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int Upgrade(const std::string& file_path,
                      ProgressCallback progress_callback,
                      EventHandler event_handler) = 0;

  /**
   * Set heartbeat policy.
   *
   * @param[in] heartbeat_param Heartbeat policy parameter.
   *
   * @param[in] heartbeat_callback Heartbeat result callback.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int StartHeartbeat(const HeartbeatParam& heartbeat_param,
                             HeartbeatResult heartbeat_callback) = 0;
  /**
   * Stop heartbeat.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int StopHeartbeat() = 0;

  /**
   * Register Event Notify.
   *
   * @param[in] error_notify_handler event notify result handler.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int RegisterDeviceErrorNotify(EventNotifyHandler error_notify_handler) = 0;

  /**
   * Get CameraModel.
   *
   * @param[out] model camera model.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetCameraModel(std::string& model) = 0;

  /**
   * Get Camera Temperature.
   *
   * @param[out] temperature temperature.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetCameraTemperature(CameraTemperature& temperature) = 0;
};

class PALM_DLL DeviceManager {
 public:
  /**
   * Create a device management singleton class.
   *
   * @return smart ptr for device manager
   */
  static std::shared_ptr<DeviceManager> GetInstance();

#ifndef __ANDROID__
  /**
   * Get all device lists connected to host.
   *
   * @param[out] device_list Pointer to device list array, reference to DeviceInformation.
   *
   * @return Zero on success, error code otherwise.
   */
  virtual int GetDeviceList(std::vector<DeviceInformation>& device_list) = 0;
#endif

  /**
   * Register device hot plug.
   *
   * @param[in] handler Callback handler.
   *
   * @param[in] enable_hotplug Default true, false :disable hot plug.
   *
   * @return void
   */
  virtual void RegisterDeviceConnectedCallback(
      std::function<void(int flag, const DeviceInformation& device_information)> handler = nullptr,
      bool enable_hotplug = true) = 0;

  /**
   * Create a device object.
   *
   * @param[in] device_information Device information.
   *
   * @return Pointer to the device object.
   */
  virtual std::shared_ptr<Device> CreateDevice(const DeviceInformation& device_information) = 0;
};

}  // namespace StreamPalm

#endif  // STREAM_INCLUDE_DEVICE_H_
