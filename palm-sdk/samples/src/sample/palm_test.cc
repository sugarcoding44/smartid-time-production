#include <algorithm>
#include <chrono>
#include <iostream>
#include <thread>
#include <vector>
#include "palm/device.h"
#include "palm_device.h"

using namespace std;
using namespace StreamPalm;
enum DevicePid { kVeinshein01 = 0x1009, kVeinshein02 = 0x2009 };

void PrintMenu() {
  std::flush(std::cout);
  std::cout << "--------------------------------------------------------------------" << std::endl;
  std::cout << "Press following key to set corresponding feature:" << std::endl;
  std::cout << "q: Program (q)uit." << std::endl;
  std::cout << "c: (C)reate device." << std::endl;
  std::cout << "o: (O)pen device." << std::endl;
  std::cout << "s: (S)tart device." << std::endl;
  std::cout << "E: EnableDimPalm." << std::endl;
  std::cout << "b: Capture face continuously." << std::endl;
  std::cout << "a: CapturePalmOnce." << std::endl;
  std::cout << "l: SetLedMode." << std::endl;
  std::cout << "t: StopPalmCapture." << std::endl;
  std::cout << "e: Close device." << std::endl;
  std::cout << "z: GetAlgorithmVersion." << std::endl;
  std::cout << "S: SavePicPipeline." << std::endl;
  std::cout << "H: SetHeartbeat." << std::endl;
  std::cout << "h: StopHeartbeat." << std::endl;
  std::cout << "G: GetDeviceInfo." << std::endl;
  std::cout << "p: Print menu." << std::endl;
  std::cout << "P: Print FPS." << std::endl;
  std::cout << "1: Create palm client." << std::endl;
  std::cout << "2: Register to server." << std::endl;
  std::cout << "3: Delete ID." << std::endl;
  std::cout << "4: Query featuresId from server." << std::endl;
  std::cout << "--------------------------------------------------------------------" << std::endl;
}
std::shared_ptr<StreamPalm::PalmDevice> palm_device = nullptr;

void callback(int flag, const DeviceInformation& info) {
  printf("callback flag: %d\n", flag);
}

void CreateDevice() {
  std::vector<DeviceInformation> device_list;
  int ret = DeviceManager::GetInstance()->GetDeviceList(device_list);
  if (ret) {
    std::cout << "[Test] Get Device List failed ! ret = " << ret << std::endl;
  }
  printf("devices info:\n");
  for (int index = 0; index < device_list.size(); index++) {
    printf("index(%d):\t device_addr:%d usb_port(%s)\n",
           index,
           device_list[index].ir_camera.device_addr,
           device_list[index].ir_camera.port_path.c_str());
  }

  std::function<void(int, const DeviceInformation&)> handle = callback;
  DeviceManager::GetInstance()->RegisterDeviceConnectedCallback(handle);
  palm_device = std::make_shared<StreamPalm::PalmDevice>(device_list[0]);
  if (device_list[0].ir_camera.pid == DevicePid::kVeinshein02) {
    palm_device->SetAlgorithemMode(StreamPalm::kRegIrVSIr);
  } else {
    palm_device->SetAlgorithemMode(StreamPalm::kBiModal);
  }

  ret = palm_device->Create();

  std::cout << "name: " << device_list[0].model
            << ", port path: " << device_list[0].ir_camera.port_path;
  std::cout << " , serial num: " << device_list[0].ir_camera.serial_number << std::endl;
  std::cout << std::endl;
}

int main() {
  std::this_thread::sleep_for(std::chrono::milliseconds(500));

  PrintMenu();

  int8_t key = '\0';
  std::cout << "please input c to create device firstly" << std::endl;

  while (key != 'q') {
    std::cin >> key;
    if (!palm_device && key != 'c') {
      std::cout << "You must create the device first by pressing 'c'." << std::endl;
      continue;
    }
    switch (key) {
      case 'c':
        CreateDevice();
        break;
      case 'o':
        palm_device->Open();
        break;
      case 's':
        palm_device->Start();
        break;
      case 'b':
        palm_device->StartPalmCapture();
        break;
      case 'E':
        palm_device->EnableDimPalm();
        break;
      case 'l':
        palm_device->SetLedMode();
        break;
      case 'a':
        palm_device->CapturePalmOnce();
        break;
      case 't':
        palm_device->StopPalmCapture();
        break;
      case 'e':
        palm_device->Close();
        break;
      case 'z':
        palm_device->GetAlgorithmVersion();
        break;
      case 'S':
        palm_device->SavePicPipeline();
        break;
      case 'H':
        palm_device->SetHeartbeat();
        break;
      case 'h':
        palm_device->StopHeartbeat();
        break;
      case 'G':
        palm_device->GetDeviceInfo();
        break;
      case '1':
        palm_device->CreatePalmClient();
        break;
      case '2':
        palm_device->RegisterToServer();
        break;
      case '3':
        palm_device->DeleteID();
        break;
      case '4':
        palm_device->QueryFeaturesIdFromServer();
        break;
      case 'p':
        PrintMenu();
        break;
      case 'P':
        palm_device->IsPrintFPS();
        break;
      default:
        break;
    }
  }
  return 0;
}