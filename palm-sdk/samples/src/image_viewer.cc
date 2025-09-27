#include "image_viewer.h"

void ImageViewer::DestroyWindows() {
  if (need_destroy_) {
    // cv::destroyWindow(rgb_preview_ + std::to_string(index_));
    cv::destroyWindow(ir_palm_ + std::to_string(index_));
    cv::destroyWindow(rgb_palm_ + std::to_string(index_));
    need_destroy_ = false;
  }
}

void ImageViewer::DestroyAllWindows() {
  cv::destroyAllWindows();
  need_destroy_ = false;
}

float ImageViewer::GetFrameRate() {
  uint64_t interval_avg = 0;
  float frame_rate = 0.0f;

  if (interval_count_ >= INTERVAL_BUFFER_SIZE) {
    interval_avg = interval_sum_ / INTERVAL_BUFFER_SIZE;
  } else if (interval_count_ > 0) {
    interval_avg = interval_sum_ / interval_count_;
  }

  if (0 != interval_avg) {
    frame_rate = 1000000.0f / interval_avg;
  }

  return frame_rate;
}

void ImageViewer::Reset() {
  last_timestamp_ = 0;
  frame_count_ = 0;
  interval_count_ = 0;
  interval_sum_ = 0;
  memset(interval_buff, 0, sizeof(interval_buff));
}

void ImageViewer::RecordTimestamp() {
  uint64_t now = duration_cast<microseconds>(system_clock::now().time_since_epoch()).count();
  frame_count_++;

  if (frame_count_ >= 2) {
    interval_sum_ -= interval_buff[interval_count_ % INTERVAL_BUFFER_SIZE];
    interval_buff[interval_count_ % INTERVAL_BUFFER_SIZE] = now - last_timestamp_;
    interval_sum_ += interval_buff[interval_count_ % INTERVAL_BUFFER_SIZE];
    interval_count_++;
  }

  last_timestamp_ = now;
}

void ImageViewer::ShowRgbPreview(uint8_t* arr,
                                 int row,
                                 int col,
                                 int palm_x,
                                 int palm_y,
                                 int palm_w,
                                 int palm_h,
                                 int preview_flag) {
  if (!need_destroy_) {
    cv::namedWindow(rgb_preview_ + std::to_string(index_), cv::WINDOW_AUTOSIZE);
    cv::namedWindow(ir_palm_ + std::to_string(index_), cv::WINDOW_AUTOSIZE);
    cv::namedWindow(rgb_palm_ + std::to_string(index_), cv::WINDOW_AUTOSIZE);
    need_destroy_ = true;
  }
  cv::Mat m;
  if (preview_flag == 1) {
    m = cv::Mat(row, col, CV_8UC3, arr);

  } else if (preview_flag == 2) {
    m = cv::Mat(row, col, CV_8UC1, arr);
  }
  cv::rectangle(m, cv::Rect(palm_x, palm_y, palm_w, palm_h), cv::Scalar(255), 3);
  cv::imshow(rgb_preview_ + std::to_string(index_), m);
  cv::waitKey(10);
}

void ImageViewer::CreateWindow() {
  if (!need_destroy_) {
    cv::namedWindow(ir_palm_ + std::to_string(index_), cv::WINDOW_AUTOSIZE);
    cv::namedWindow(rgb_palm_ + std::to_string(index_), cv::WINDOW_AUTOSIZE);
    need_destroy_ = true;
  }
  cv::waitKey(10);
}

void ImageViewer::ShowBgrPreview(uint8_t* arr, int row, int col) {
  if (!need_destroy_) {
    cv::namedWindow(rgb_preview_ + std::to_string(index_), cv::WINDOW_AUTOSIZE);
    cv::namedWindow(ir_palm_ + std::to_string(index_), cv::WINDOW_AUTOSIZE);
    cv::namedWindow(rgb_palm_ + std::to_string(index_), cv::WINDOW_AUTOSIZE);
    need_destroy_ = true;
  }
  cv::Mat m(row, col, CV_8UC3, arr);
  cv::Mat dst;
  cv::cvtColor(m, dst, cv::COLOR_BGR2RGB);
  cv::flip(dst, dst, 1);
  cv::imshow(rgb_preview_ + std::to_string(index_), dst);
  cv::waitKey(10);
}

void ImageViewer::ShowU8Image(uint8_t* arr,
                              int row,
                              int col,
                              bool save,
                              const std::string& file_path,
                              int palm_x,
                              int palm_y,
                              int palm_w,
                              int palm_h) {
  cv::Mat m(row, col, CV_8UC1, arr);
  if (save) {
    cv::imwrite(file_path, m);
  }
  cv::rectangle(m, cv::Rect(palm_x, palm_y, palm_w, palm_h), cv::Scalar(255), 3);
  cv::imshow(ir_palm_ + std::to_string(index_), m);
  cv::waitKey(10);
}

void ImageViewer::ShowRgbImage(uint8_t* arr,
                               int row,
                               int col,
                               bool save,
                               const std::string& file_path,
                               int palm_x,
                               int palm_y,
                               int palm_w,
                               int palm_h) {
  cv::Mat m(row, col, CV_8UC3, arr);
  if (save) {
    cv::imwrite(file_path, m);
  }
  cv::rectangle(m, cv::Rect(palm_x, palm_y, palm_w, palm_h), cv::Scalar(255), 3);
  cv::imshow(rgb_palm_ + std::to_string(index_), m);
  cv::waitKey(10);
}

void ImageViewer::ShowBgrImage(uint8_t* arr,
                               int row,
                               int col,
                               bool save,
                               const std::string& file_path) {
  cv::Mat m(row, col, CV_8UC3, arr);
  cv::Mat dst;
  cv::cvtColor(m, dst, cv::COLOR_BGR2RGB);
  if (save) {
    cv::imwrite(file_path, dst);
  }
  cv::imshow(rgb_palm_ + std::to_string(index_), dst);
  cv::waitKey(10);
}
