#ifndef TEST_STREAM_PALM_UTILS_H_
#define TEST_STREAM_PALM_UTILS_H_

#include <iostream>
#include "opencv2/opencv.hpp"
#include "palm/stream_types.h"

namespace StreamPalm {

std::ostream& operator<<(std::ostream& out, const Version& v);
std::ostream& operator<<(std::ostream& out, const DeviceVersionInfo& info);
std::ostream& operator<<(std::ostream& out, const StreamDeviceVersionInfo& info);
std::string FeatureCodeToString(int code);
uint64_t GetRandomNum();
void PrintCurrentTime();

#ifndef DISABLE_INTERFACE
void OpencvShowFrame(const StreamPalmFrames& frames);
#endif

StreamData VectorToData(const std::vector<float>& features);

int ReadJpgImageToFrame(const std::string& filePath, std::shared_ptr<Frame>& frame);
int ReadImageToFrame(const cv::Mat& image, Frame& frame);
bool BitIsOne(uint32_t data, uint32_t bit);

}  // namespace StreamPalm

#endif  // TEST_STREAM_PALM_UTILS_H_
