cmake_minimum_required(VERSION 3.1.6 FATAL_ERROR)
project(palm_test)

include_directories(..)
include_directories(../../../include)
link_directories(../../../lib)

if(DISABLE_INTERFACE)
  add_definitions(-DDISABLE_INTERFACE)
endif()
# find opencv
#set(OpenCV_DIR "D:\\install\\opencv-4.6\\opencv\\build") # Alternative you can input cmake parameter from when cmake building
# Win32 needs to configure this environment variable
if(NOT DEFINED OpenCV_DIR)
  # Get OpenCV from system environment
  if(DEFINED ENV{OpenCV_INSTALL_PATH})
    set(OpenCV_DIR $ENV{OpenCV_INSTALL_PATH})
  endif()
endif()

find_package(OpenCV REQUIRED)
if(DEFINED OpenCV_LIBS AND DEFINED OpenCV_INCLUDE_DIRS)
  set(OpenCV_FOUND TRUE)
  include_directories(${OpenCV_INCLUDE_DIRS})
else()
  set(OpenCV_FOUND FALSE)
endif()

set(SAMPLE_FILES
    ${SAMPLE_FILES}
    palm_device.h
    palm_device.cc
    palm_test.cc
)

set(SAMPLE_COMMON_FILES
    ${SAMPLE_COMMON_FILES}
    ../frame_rate_helper.h 
    ../sample_utils.h 
    ../sample_utils.cc
)
    
if(NOT DISABLE_INTERFACE)
  set(SAMPLE_COMMON_FILES
    ${SAMPLE_COMMON_FILES}
    ../image_viewer.h ../image_viewer.cc 
  )
endif()


add_executable(palm_test ${SAMPLE_FILES} ${SAMPLE_COMMON_FILES})

target_link_libraries(palm_test
  ${OpenCV_LIBS}
  palm_sdk
)

install(TARGETS palm_test DESTINATION samples/veinshine01_bin)

install(FILES ${SAMPLE_COMMON_FILES} DESTINATION samples/src)
install(DIRECTORY ./ DESTINATION samples/src/sample)


