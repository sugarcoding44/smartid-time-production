#include "palm_device.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include "frame_rate_helper.h"
#include "palm/arithmetic_device.h"
namespace StreamPalm {

void FrameDeleter(Frame* frame) {
  if (frame) {
    // 释放 Frame 对象中的 data 内存
    if (frame->data) {
      std::cout << "Deleting frame data..." << std::endl;
      delete[] frame->data;
      frame->data = nullptr;
    }
    // 释放 Frame 对象本身
    delete frame;
  }
}
static std::ostream& operator<<(std::ostream& out, const CapturePalmResult& result) {
  PrintCurrentTime();
  switch (result.capture_handler_status) {
    case PalmDetectStatus::kPalmDetected:
      out << ", Palm Detected";
      if (result.live_palm_errors == 0) {
        out << "-->Live !";
      } else {
        // internal
        out << "(";
        uint32_t error_code = result.live_palm_errors >> 4;
        if (BitIsOne(error_code, (uint32_t) HintMap::kAngled)) {
          out << "Angled,";
        }
        if (BitIsOne(error_code, (uint32_t) HintMap::kCovered)) {
          out << "Covered,";
        }
        if (BitIsOne(error_code, (uint32_t) HintMap::kIrLiveness)) {
          out << "IR Liveness,";
        }
        out << ")";
      }
      break;
    case PalmDetectStatus::kNoPalmDetected:
      out << ", No PalmDetected";
      break;
    case PalmDetectStatus::kManualStop:
      out << ", Manual Stop";
      break;
    case PalmDetectStatus::kTimeout:
      out << ", Timeout";
      break;
    case PalmDetectStatus::kInitializing:
      out << ", Initializing";
      break;
    default:
      out << ", Unknow Status";
      break;
  }

  out << std::dec;
  return out;
}

PalmDevice::~PalmDevice() {
  std::cout << "[Test] Palm device destroy" << std::endl;
}
PalmDevice::PalmDevice(DeviceInformation device_info) : device_info_(device_info) {
#ifndef DISABLE_INTERFACE
  viewer_.reset(new ImageViewer(device_info.model + " " + device_info.ir_camera.serial_number +
                                "_" + std::to_string(GetRandomNum())));
#endif
  result_flag_.store(false);
  // system("chcp 65001");

  callback_ = [&](const StreamPalm::CapturePalmResult& result) {
    result_flag_.store(false);
    std::unique_lock<std::mutex> lock(mutex_);
    capture_result_ = result;
    lock.unlock();
    if (result.capture_handler_status == StreamPalm::PalmDetectStatus::kTimeout) {
      std::cout << "time out " << std::endl;
    }
    std::cout << "-----capture_handler_status=" << (int) result.capture_handler_status
              << "----live_palm_errors=" << (int) result.live_palm_errors
              << "----score=" << result.score << std::endl;
    if (result.capture_handler_status == PalmDetectStatus::kNoPalmDetected) {
      std::cout << "no detect palm" << std::endl;
    } else if (result.capture_handler_status == PalmDetectStatus::kPalmDetected) {
      if (result.live_palm_errors == (int) HintMap::kAngled) {
        std::cout << "big angel" << std::endl;
      } else if (result.live_palm_errors == (int) HintMap::kCovered) {
        std::cout << "hide" << std::endl;
      } else if (result.live_palm_errors == (int) HintMap::kIrLiveness) {
        std::cout << "no detect liveness" << std::endl;
      }
    }
    // live face preview
    if (!is_open_)
      return;
#ifndef DISABLE_INTERFACE
    viewer_->CreateWindow();
#endif
    if (result.capture_handler_status == StreamPalm::PalmDetectStatus::kPalmDetected &&
        result.live_palm_errors == 0) {

      // std::unique_lock<std::mutex> lock(mutex_);
      // condv_.notify_all();

#ifndef DISABLE_INTERFACE
      std::string save_path = std::to_string(
          std::chrono::system_clock::now().time_since_epoch().count());
      result_flag_.store(true);

      // while (is_open_ && device_) {
      if (result_flag_.load()) {
        std::unique_lock<std::mutex> lock(mutex_);

        if (capture_result_.img_rgb.get() != nullptr)
          viewer_->ShowRgbImage((uint8_t*) capture_result_.img_rgb->data,
                                capture_result_.img_rgb->rows,
                                capture_result_.img_rgb->cols,
                                save_picture_,
                                ".rgb.png",
                                capture_result_.palm_bbox.x,
                                capture_result_.palm_bbox.y,
                                capture_result_.palm_bbox.w,
                                capture_result_.palm_bbox.h);
        if (capture_result_.img_ir.get() != nullptr)
          viewer_->ShowU8Image((uint8_t*) capture_result_.img_ir->data,
                               capture_result_.img_ir->rows,
                               capture_result_.img_ir->cols,
                               save_picture_,
                               ".ir.png",
                               capture_result_.palm_bbox.x,
                               capture_result_.palm_bbox.y,
                               capture_result_.palm_bbox.w,
                               capture_result_.palm_bbox.h);
        result_flag_.store(false);
        lock.unlock();
      }
      if (!enable_contious_capture_) {
        viewer_->DestroyWindows();
      }
#endif
    }
  };
}

int PalmDevice::Create() {
  std::shared_ptr<Device> Device = DeviceManager::GetInstance()->CreateDevice(device_info_);

  device_ = Device;

  int ret = PalmCapture::Create(device_, &palm_);

  return ret;
}

void PalmDevice::Open() {
  std::cout << "test: open" << std::endl;
  if (!device_) {
    std::cout << "[Test] Create device first" << std::endl;
    return;
  }
  device_->Open();
  is_open_ = true;
}

void PalmDevice::Start() {
  if (!is_open_) {
    std::cout << "[Test] Open device first" << std::endl;
    return;
  }
  auto func = [&] {
    Stream* stream;
    int ret = device_->CreateStream(stream, kRgbIr);
    ret = stream->Start();

    StreamPalmFrames frames;
    FrameRateHelper frame_rate_helper;
    long cnt = 0;
    while (is_open_) {
      ret = stream->GetFrames(frames, 2000);
#ifndef DISABLE_INTERFACE
      OpencvShowFrame(frames);
#endif
      frame_rate_helper.RecordTimestamp();
      if (is_print_fps && 0 == cnt++ % 10) {
        std::cout << "fps: " << frame_rate_helper.GetFrameRate() << std::endl;
      }
    }
  END:
    stream->Stop();
    device_->DestroyStream(stream);
#ifndef DISABLE_INTERFACE
    viewer_->DestroyAllWindows();
#endif
  };
  std::thread(func).detach();
}

void PalmDevice::StartPalmCapture() {
  if (!is_open_) {
    std::cout << "[Test] Open device first" << std::endl;
    return;
  }
  enable_contious_capture_ = true;
#ifndef DISABLE_INTERFACE
  viewer_->DestroyWindows();
#endif
  palm_->StartPalmCapture(callback_, 1000 * 15);  // 5 seconds timeout
}

void PalmDevice::EnableDimPalm() {
  if (!is_open_) {
    std::cout << "[Test] Open device first" << std::endl;
    return;
  }
  std::dynamic_pointer_cast<ArithmeticDevice>(device_)->EnableDimPalm(true);
}

void PalmDevice::SetLedMode() {
  if (!is_open_) {
    std::cout << "[Test] Open device first" << std::endl;
    return;
  }
  std::cout << "Input led mode 1-20" << std::endl;
  int mode = 0;
  std::cin >> mode;

  int ret = device_->SetLedMode((LedMode) mode);
  if (ret) {
    std::cout << "SetLedMode failed,ret = " << ret << std::endl;
  } else {
    std::cout << "SetLedMode success." << std::endl;
  }
}

void PalmDevice::CapturePalmOnce() {
  if (!is_open_) {
    std::cout << "[Test] Open device first" << std::endl;
    return;
  }
  enable_contious_capture_ = false;
#ifndef DISABLE_INTERFACE
  viewer_->DestroyWindows();
#endif
  int ret = palm_->CapturePalmOnce(callback_, 1000 * 15);
  if (ret)
    std::cout << "CapturePalmOnce failed, ret: " << ret << std::endl;
}

void PalmDevice::StopPalmCapture() {
  if (!is_open_) {
    std::cout << "[Test] Open device first" << std::endl;
    return;
  }
  palm_->StopPalmCapture();
  std::cout << "[Test] stop face capture success" << std::endl;
}

void PalmDevice::Close() {
  if (!is_open_) {
    std::cout << "[Test] Open device first" << std::endl;
    return;
  }
  is_open_ = false;
  auto start_time = std::chrono::steady_clock::now();
  std::cout << "[Test] closing..." << std::endl;
  int ret = device_->Close();
  if (ret) {
    std::cout << "close device failed" << std::endl;
  }

  auto need_time = (std::chrono::steady_clock::now() - start_time).count();
  std::cout << "[Close]: " << need_time / 1000000 << " ms" << std::endl;
  if (ret == kOk) {
    std::cout << "[Test] close device success" << std::endl;
  } else {
    std::cout << "Close failed, ret: " << ret << std::endl;
  }
}

void PalmDevice::GetAlgorithmVersion() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  }
  std::string algorithm_version;
  int ret = palm_->GetAlgorithmVersion(algorithm_version);
  if (ret == kOk) {
    std::cout << "Palm Algorithm: " << std::endl;
    std::cout << algorithm_version << std::endl;
  } else {
    std::cout << "[Test] GetAlgorithmVersion face error: " << ret << std::endl;
  }
}

void PalmDevice::SavePicPipeline() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  };
  std::string save_path = "";
  std::cout << "Input save path" << std::endl;
  std::cin >> save_path;

  int num = 0;
  std::cout << "Input save num" << std::endl;
  std::cin >> num;
  int ret = 0;

  ret = std::dynamic_pointer_cast<ArithmeticDevice>(device_)->StartSavePictures(save_path, num);

  if (ret) {
    std::cout << "SavePicPipeline failed,ret = " << ret << std::endl;
  } else {
    std::cout << "SavePicPipeline success." << std::endl;
  }
}

void PalmDevice::SetHeartbeat() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  };
  HeartbeatParam heartbeat_param;
  int ret = device_->StartHeartbeat(heartbeat_param, [](int value) {
    std::cout << "heart callback: " << value << std::endl;
  });
  if (ret) {
    std::cout << "SetHeartbeat failed,ret = " << ret << std::endl;
  } else {
    std::cout << "SetHeartbeat success." << std::endl;
  }
}

void PalmDevice::StopHeartbeat() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  };
  int ret = device_->StopHeartbeat();
  if (ret) {
    std::cout << "StopHeartbeat failed,ret = " << ret << std::endl;
  } else {
    std::cout << "StopHeartbeat success." << std::endl;
  }
}

void PalmDevice::GetDeviceInfo() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  };
  DeviceDescription device_info;
  int ret = device_->GetDeviceInfo(device_info);
  std::cout << "device_name " << device_info.device_name << std::endl;
  std::cout << "serial_num " << device_info.serial_num << std::endl;
  std::cout << "stream_sdk_version " << device_info.stream_sdk_version << std::endl;
  std::cout << "palm_sdk_version " << device_info.palm_sdk_version << std::endl;
  std::cout << "rgb_firmware_version " << device_info.rgb_firmware_version << std::endl;
  std::cout << "ir_firmware_version " << device_info.ir_firmware_version << std::endl;
  if (ret) {
    std::cout << "GetDeviceInfo failed,ret = " << ret << std::endl;
  } else {
    std::cout << "GetDeviceInfo success." << std::endl;
  }
}
void PalmDevice::IsPrintFPS() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  };
  is_print_fps = !is_print_fps;
}

void PalmDevice::SetAlgorithemMode(StreamPalm::RecognizeMode mode) {
  mode_ = mode;
}

void PalmDevice::CreatePalmClient() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  };
  std::string company_id;
  std::string sn;
  std::string ip;
  std::string port;
  std::string erro_string;
  std::cout << "company_id: " << std::endl;
  std::cin >> company_id;
  std::cout << "sn: " << std::endl;
  std::cin >> sn;
  std::cout << "ip: " << std::endl;
  std::cin >> ip;
  std::cout << "port: " << std::endl;
  std::cin >> port;

  int ret = StreamPalm::PalmClient::CreatePalmClient(&client_,
                                                     palm_,
                                                     erro_string,
                                                     company_id,
                                                     sn,
                                                     ip,
                                                     port);
  std::cout << "CreatePalmClient, ret: " << ret << " erro_string: " << erro_string << std::endl;
}
void PalmDevice::RegisterToServer() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  };
  if (!client_) {
    std::cout << "[Test] you should creat client!" << std::endl;
    return;
  }
  std::shared_ptr<Frame> palm_ir_img(new Frame(), FrameDeleter);
  std::shared_ptr<Frame> palm_rgb_img(new Frame(), FrameDeleter);
  std::string rgb_img_path = "";
  std::string ir_img_path = "";
  std::cout << "input picture path of ir_img" << std::endl;
  std::cin >> ir_img_path;
  int ret = ReadJpgImageToFrame(ir_img_path, palm_ir_img);
  if (mode_ == StreamPalm::kBiModal) {
    std::cout << "input picture path of rgb_img" << std::endl;
    std::cin >> rgb_img_path;
    ret = ReadJpgImageToFrame(rgb_img_path, palm_rgb_img);
  }
  std::vector<float> rgb_features;
  std::vector<float> ir_features;
  int result;
  float score;
  std::vector<float> skeleton;
  int palm_type;
  int features_id;
  std::string error_string;
  if (!ret) {
    ret = palm_->ExtractPalmFeaturesFromImg(result,
                                            score,
                                            ir_features,
                                            rgb_features,
                                            skeleton,
                                            palm_type,
                                            mode_,
                                            *palm_ir_img,
                                            *palm_rgb_img);
    std::cout << "ExtractPalmFeaturesFromImg, ret: " << ret << " result: " << result << std::endl;

    ret = client_->RegisterToServer(*palm_rgb_img,
                                    *palm_ir_img,
                                    rgb_features,
                                    ir_features,
                                    features_id,
                                    error_string);
    std::cout << "features_id: " << features_id << std::endl;
    std::cout << "RegisterToServer, ret: " << ret << " errpr_string: " << error_string << std::endl;
  }
}
void PalmDevice::DeleteID() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  };
  if (!client_) {
    std::cout << "[Test] you should creat client!" << std::endl;
    return;
  }
  int features_id;
  std::cout << "input features_id :" << std::endl;
  std::cin >> features_id;
  std::string err;
  int ret = client_->DeleteID(features_id, err);
  std::cout << "PalmTestToolDeviceVeinshine01::DeleteID, ret: " << ret << " error string: " << err
            << std::endl;
}

void PalmDevice::QueryFeaturesIdFromServer() {
  if (!is_open_) {
    std::cout << "[Test] open device first" << std::endl;
    return;
  };

  if (!client_) {
    std::cout << "[Test] you should creat client!" << std::endl;
    return;
  }
  std::string ir_img_path;
  std::string rgb_img_path;
  int result;
  float score;
  std::vector<float> ir_features;
  std::vector<float> rgb_features;
  std::vector<float> skeleton;
  int palm_type;
  std::shared_ptr<Frame> palm_ir_img(new Frame(), FrameDeleter);
  std::shared_ptr<Frame> palm_rgb_img(new Frame(), FrameDeleter);
  std::cout << "input picture path of ir_img" << std::endl;
  std::cin >> ir_img_path;
  int ret = ReadJpgImageToFrame(ir_img_path, palm_ir_img);
  if (mode_ == StreamPalm::kBiModal) {
    std::cout << "input picture path of rgb_img" << std::endl;
    std::cin >> rgb_img_path;
    ret = ReadJpgImageToFrame(rgb_img_path, palm_rgb_img);
  }
  if (!ret) {
    ret = palm_->ExtractPalmFeaturesFromImg(result,
                                            score,
                                            ir_features,
                                            rgb_features,
                                            skeleton,
                                            palm_type,
                                            mode_,
                                            *palm_ir_img,
                                            *palm_rgb_img);
  }
  if (ret) {
    std::cout << "Extract PalmFeatures For Img failure !, ret: " << ret << std::endl;
    return;
  }
  int features_id;
  std::string error_string;
  ret = client_->QueryFeaturesIdFromServer(*palm_rgb_img,
                                           *palm_ir_img,
                                           rgb_features,
                                           ir_features,
                                           features_id,
                                           error_string);
  std::cout << "PalmTestToolDeviceVeinshine01::QueryFeaturesIdFromServer, ret: " << ret
            << ", error string: " << error_string << std::endl;
  std::cout << "features_id: " << features_id << std::endl;
}

}  // namespace StreamPalm