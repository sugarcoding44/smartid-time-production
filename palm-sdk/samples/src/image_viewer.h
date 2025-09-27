#ifndef TEST_IMAGE_VIEWER_H_
#define TEST_IMAGE_VIEWER_H_

#include <chrono>
#include <string>
#include "opencv2/opencv.hpp"
#include "palm/common_types.h"
#define INTERVAL_BUFFER_SIZE 32
using namespace std::chrono;
class ImageViewer {
 public:
  ImageViewer(const std::string& title) : title_(title) {
    // cv::startWindowThread();
    Reset();
  }
  ~ImageViewer() = default;
  float GetFrameRate();
  void Reset();
  void RecordTimestamp();
  void ShowRgbPreview(uint8_t* arr,
                      int row,
                      int col,
                      int palm_x,
                      int palm_y,
                      int palm_w,
                      int palm_h,
                      int preview_flag);
  void ShowBgrPreview(uint8_t* arr, int row, int col);
  void ShowU8Image(uint8_t* arr,
                   int row,
                   int col,
                   bool save,
                   const std::string& file_path,
                   int palm_x,
                   int palm_y,
                   int palm_w,
                   int palm_h);
  void ShowRgbImage(uint8_t* arr,
                    int row,
                    int col,
                    bool save,
                    const std::string& file_path,
                    int palm_x,
                    int palm_y,
                    int palm_w,
                    int palm_h);
  void ShowBgrImage(uint8_t* arr, int row, int col, bool save, const std::string& file_path);
  void IncreaseIndex() {
    DestroyWindows();
    ++index_;
  }

  void DestroyWindows();
  void DestroyAllWindows();
  void CreateWindow();

 private:
  std::string title_;
  std::string rgb_preview_ = "preview " + title_;
  std::string rgb_palm_ = "rgb palm " + title_;
  std::string ir_palm_ = "ir palm " + title_;
  size_t index_ = 0;
  bool need_destroy_ = false;
  uint64_t last_timestamp_;
  uint64_t frame_count_;
  uint64_t interval_count_;
  uint64_t interval_sum_;
  uint64_t interval_buff[INTERVAL_BUFFER_SIZE];
};

#endif  // TEST_IMAGE_VIEWER_H_
