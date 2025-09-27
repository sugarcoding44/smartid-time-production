#include "sample_utils.h"
#include <chrono>
#include <iomanip>
#include <random>

namespace StreamPalm {

std::ostream& operator<<(std::ostream& out, const Version& v) {
  out << std::to_string(v.major) << "." << std::to_string(v.minor) << "."
      << std::to_string(v.revision);
  return out;
}

std::string FeatureCodeToString(int code) {
  switch (code) {
    case 0x101:
      return "image pixel error";
    case 0x102:
      return "timeout";
    case 0x103:
      return "failed to detect face";
    case 0x104:
      return "failed to get feature";
    case 0x105:
      return "failed to allocate memory";
    case 0x106:
      return "image size error";
    case 0x107:
      return "image name error";
    case 0x108:
      return "failed to load image";
    case 0x109:
      return "failed to inster feature";
    default:
      return std::to_string(code);
  }
}

std::ostream& operator<<(std::ostream& out, const DeviceVersionInfo& info) {
  std::cout << "camera version: " << info.camera_sdk_version << std::endl;
  std::cout << "ir firmware version: " << info.firmware_version << std::endl;
  std::cout << "rgb firmware version: " << info.rgb_firmware_version << std::endl;
  std::cout << "calib version: " << info.calib_version << std::endl;
  std::cout << "depth version: " << info.depth_version << std::endl;
  return out;
}

std::ostream& operator<<(std::ostream& out, const StreamDeviceVersionInfo& info) {
  std::cout << "camera version: " << info.camera_sdk_version << std::endl;
  std::cout << "kernel version: " << info.kernel_version << std::endl;
  std::cout << "depth version: " << info.depth_version << std::endl;
  return out;
}

bool BitIsOne(uint32_t data, uint32_t bit) {
  return (data & bit) == bit;
}

uint64_t GetRandomNum() {
  uint32_t value = std::random_device{}();
  std::cout << "generator num: " << value << std::endl;
  return value;
}

void PrintCurrentTime() {
  auto t = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
  std::cout << std::put_time(std::localtime(&t), "%F %T");
}

StreamData VectorToData(const std::vector<float>& features) {
  StreamData streamData;

  // 计算数据长度
  streamData.data_len = features.size() * sizeof(float);

  // 分配内存
  streamData.data = std::shared_ptr<uint8_t>(new uint8_t[streamData.data_len],
                                             std::default_delete<uint8_t[]>());

  // 将 std::vector<float> 数据复制到内存中
  std::memcpy(streamData.data.get(), features.data(), streamData.data_len);

  return streamData;
}

void OpencvShowFrame(const StreamPalmFrames& frames) {
  long long int current_win_index_;
  bool rgb_first_show_flag_{true};
  bool ir_first_show_flag_{true};
  std::vector<std::string> win_name_vec_;
  for (int index = 0; index < frames.count; index++) {
    FrameType frame_type = frames.frame_ptr[index]->frame_type;
    // std::string current_win_index = std::to_string(current_win_index_) + "_" +
    //                                 std::to_string(index);
    switch (frame_type) {
      case kRgbFrame: {
        cv::Mat frame_mat(frames.frame_ptr[index]->rows,
                          frames.frame_ptr[index]->cols,
                          CV_8UC3,
                          (uint8_t*) (frames.frame_ptr[index]->data.get()));
        cv::imshow("Rgb", frame_mat);
        cv::waitKey(1);
        if (rgb_first_show_flag_) {
          win_name_vec_.emplace_back("Rgb");
          rgb_first_show_flag_ = false;
        }
        break;
      }
      case kIrFrame: {
        if (frames.frame_ptr[index]->data && frames.frame_ptr[index]->size != 0) {
          cv::Mat frame_mat(frames.frame_ptr[index]->rows,
                            frames.frame_ptr[index]->cols,
                            CV_8UC1,
                            (uint8_t*) (frames.frame_ptr[index]->data.get()));
          cv::imshow("Ir", frame_mat);
          cv::waitKey(1);
          if (ir_first_show_flag_) {
            win_name_vec_.emplace_back("Ir");
            ir_first_show_flag_ = false;
          }
        }
        break;
      }
      default:
        break;
    }
  }
}

int ReadJpgImageToFrame(const std::string& filePath, std::shared_ptr<Frame>& frame) {
  cv::Mat image = cv::imread(filePath, cv::IMREAD_UNCHANGED);

  if (image.empty()) {
    std::cout << "Failed to load image" << std::endl;
    return 1;
  }

  frame->index = 0;
  frame->size = static_cast<int>(image.total() * image.elemSize());  // 数据大小（字节数）
  frame->cols = image.cols;                                          // 图像列数
  frame->rows = image.rows;                                          // 图像行数
  frame->bits_per_pixel = image.elemSize() * 8;  // 每像素位数（8位*通道数）
  frame->temperature = 0;                        // 驱动温度
  frame->frame_type = (image.channels() == 3) ? FrameType::kRgbFrame :
                                                FrameType::kIrFrame;  // 帧类型
  frame->image_format = ImageFormat::kJpeg;                           // 图像格式
  frame->timestamp = static_cast<uint64_t>(std::chrono::system_clock::now().time_since_epoch() /
                                           std::chrono::milliseconds(1));  // 时间戳

  // 分配并复制图像数据
  frame->data = new uint8_t[frame->size];
  std::memcpy(frame->data, image.data, frame->size);

  return 0;
}

int ReadImageToFrame(const cv::Mat& image, Frame& frame) {
  if (image.empty()) {
    std::cout << "Failed to load image";
    return 1;
  }

  frame.index = 0;
  frame.size = static_cast<int>(image.total() * image.elemSize());  // 数据大小（字节数）
  frame.cols = image.cols;                                          // 图像列数
  frame.rows = image.rows;                                          // 图像行数
  frame.bits_per_pixel = image.elemSize() * 8;  // 每像素位数（8位*通道数）
  frame.temperature = 0;                        // 驱动温度
  frame.frame_type = (image.channels() == 3) ? FrameType::kRgbFrame :
                                               FrameType::kIrFrame;  // 帧类型
  frame.image_format = ImageFormat::kJpeg;                           // 图像格式
  frame.timestamp = static_cast<uint64_t>(std::chrono::system_clock::now().time_since_epoch() /
                                          std::chrono::milliseconds(1));  // 时间戳

  // 分配并复制图像数据
  frame.data = new uint8_t[frame.size];
  std::memcpy(frame.data, image.data, frame.size);

  return 0;
}

}  // namespace StreamPalm
