#include <atomic>
#include <mutex>
#include <thread>
#include "image_viewer.h"
#include "palm/arithmetic_device.h"
#include "palm/compare_arithmetic.h"
#include "palm/palm_client.h"
#include "sample_utils.h"
namespace StreamPalm {
class PalmDevice {
 public:
  PalmDevice(DeviceInformation device_info);
  ~PalmDevice();
  int Create();
  void Open();
  void Start();
  void StartPalmCapture();
  void EnableDimPalm();
  void SetLedMode();
  void CapturePalmOnce();
  void StopPalmCapture();
  void Close();
  void GetAlgorithmVersion();
  void SavePicPipeline();
  void SetHeartbeat();
  void StopHeartbeat();
  void GetDeviceInfo();
  void IsPrintFPS();

  void CreatePalmClient();
  void RegisterToServer();
  void DeleteID();
  void QueryFeaturesIdFromServer();

  void SetAlgorithemMode(StreamPalm::RecognizeMode mode);

 private:
  DeviceInformation device_info_;
  std::shared_ptr<StreamPalm::Device> device_;
  std::shared_ptr<StreamPalm::PalmCapture> palm_;
  std::function<void(const StreamPalm::CapturePalmResult& result)> callback_;
  std::shared_ptr<ImageViewer> viewer_;
  StreamPalm::CapturePalmResult capture_result_;
  std::atomic<bool> result_flag_;
  std::mutex mutex_;
  bool is_print_fps{false};
  bool is_open_{false};
  bool is_start_{false};
  StreamData features1_;
  StreamData features2_;
  bool save_picture_ = false;
  bool enable_contious_capture_ = false;
  StreamPalm::RecognizeMode mode_;
  std::shared_ptr<StreamPalm::PalmClient> client_;
};

}  // namespace StreamPalm