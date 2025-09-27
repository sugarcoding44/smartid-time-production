# palm-sdk Release 1.3.41:

## Bug Fixes and Other Changes
1. 修改脚本文件
2. 修改文档
3. 修改远程仓库名称
## Submodule Versions


# palm-sdk Release 1.3.40:

## Bug Fixes and Other Changes
1. 添加脚本文件，不用sudo权限即可打开设备
2. 添加arm-v8编译
3. 解决示例程序导入图片失败问题
## Submodule Versions

# palm-sdk Release 1.3.39:

## Bug Fixes and Other Changes
1. 更新模型版本
## Submodule Versions
2. DimPalmModelVersion v1.2.8

# palm-sdk Release 1.3.38:

## Bug Fixes and Other Changes
1. 更新dim-palm版本
2. 更新模型版本
## Submodule Versions
1. DimPalmVersion v1.2.7
2. DimPalmModelVersion v1.2.7

# palm-sdk Release 1.3.37:

## Bug Fixes and Other Changes
1. 更新camera-sdk版本
2. 修改文档和release-md
3. 更新stream-sdk版本
## Submodule Versions
1. camera-sdk v2.12.4
2. stream sdk v1.5.22

# palm-sdk Release 1.3.36:

## Bug Fixes and Other Changes
1. 更新stream-sdk版本
2. 更新模型版本
3. 更新dim-palm版本
4. 统一算法枚举
5. 算法灯光调整
## Submodule Versions
1. DimPalmVersion v1.2.6
2. DimPalmModelVersion v1.2.6
3. stream sdk v1.5.21

# palm-sdk Release 1.3.35:

## Bug Fixes and Other Changes
1. 更新palm-client版本
## Submodule Versions
1. palm-client sdk v0.1.11

# palm-sdk Release 1.3.34:

## Bug Fixes and Other Changes
1. 更新dim-palm版本
2. 更新stream-sdk版本
## Submodule Versions
1. DimPalmVersion v1.2.5
3. stream sdk v1.5.20

# palm-sdk Release 1.3.33:

## Bug Fixes and Other Changes
1. sample下的cmakelist可以单独编译
2. 修改开启心跳的入参结构体
3. 更新dim-palm版本
4. 修改比对接口
5. 更新stream-sdk版本
6. 更新文档
## Submodule Versions
2. DimPalmVersion v1.2.4
3. stream sdk v1.5.19


# palm-sdk Release 1.3.32:

## Bug Fixes and Other Changes
1. 更新stream-sdk版本
2. 更新palm-client版本
3. sample添加本地比对和云端比对版本
4. 修复createclient的ip不正确时仍然返回成功的问题
5. 修复多次初始化算法失败问题
6. 修复单次抓拍无法停止抓拍问题
7. 修复打印license问题
8. 完善示例程序
## Submodule Versions
1. stream sdk v1.5.18
2. palm-client v0.1.10


# palm-sdk Release 1.3.31:

## Bug Fixes and Other Changes
1. 更新stream-sdk版本
2. 修改算法校验模式
3. ci增加海思编译job
## Submodule Versions
1. stream sdk v1.5.17

# palm-sdk Release 1.3.30:

## Bug Fixes and Other Changes
1. 解决插拔模组崩溃问题
2. 解决算法使能失败问题
3. 更新驱动
4. 更新stream-sdk版本
## Submodule Versions
1. stream sdk v1.5.16

# palm-sdk Release 1.3.29:

## Bug Fixes and Other Changes
1. 添加单模态比对接口
2. 算法接口对单ir模组进行适配
3. 修改部分接口入参
4. 更新文档
5. 更新stream-sdk版本
## Submodule Versions
1. stream sdk v1.5.15

# palm-sdk Release 1.3.28:

## Bug Fixes and Other Changes
1. 更新stream-sdk版本
2. 完善错误码
3. 移除仓库中的模型，改用脚本下载
4. 去除部分依赖的三方库
5. 更新文档
## Submodule Versions
1. stream sdk v1.5.14

# palm-sdk Release 1.3.27:

## Bug Fixes and Other Changes
1. 更新stream-sdk版本(适配单ir)
2. 更新算法版本和配置文件
## Submodule Versions
1. stream sdk v1.5.13
1. dim-palm sdk v1.2.1

# palm-sdk Release 1.3.26:

## Bug Fixes and Other Changes
1. 增加arm-v7版本
2. sample增加帧率打印
## Submodule Versions
1. stream sdk v1.5.12

# palm-sdk Release 1.3.25:

## Bug Fixes and Other Changes
1. 更新dim-palm-sdk版本
## Submodule Versions
1. dim-palm sdk v1.2.0

# palm-sdk Release 1.3.24:

## Bug Fixes and Other Changes
1. 更新dim-palm-sdk版本
2. 更新文档
3. 修改部分接口名称
## Submodule Versions
1. dim-palm sdk v1.1.8

# palm-sdk Release 1.3.23:

## Bug Fixes and Other Changes
1. 更新stream-sdk版本
2. 删除部分无用代码
## Submodule Versions
1. stream sdk v1.5.11

# palm-sdk Release 1.3.22:

## Bug Fixes and Other Changes
1. 更新文档
2. 更新驱动
3. 修改头文件的一些参数名称
## Submodule Versions

# palm-sdk Release 1.3.21:

## Bug Fixes and Other Changes
1. 更新camera-sdk版本
2. 更新stream版本
## Submodule Versions
1. stream sdk v1.5.10
2. camera-sdk v2.10.93

# palm-sdk Release 1.3.20:

## Bug Fixes and Other Changes
1. 本地比对不会去链接client库
2. 更新stream版本
3. 更改palm头文件的目录结构
4. 解决Linux出流时打开灯光崩溃问题
5. 出流时关闭设备再开机崩溃问题
## Submodule Versions
1. stream sdk v1.5.9

# palm-sdk Release 1.3.18:

## Bug Fixes and Other Changes
1. 在sample中添加disable_interface宏定义控制流的开关
2. 使能算法添加sn校验
3. 解决内存泄漏问题
4. 解决close后再打开设备崩溃问题
## Submodule Versions


# palm-sdk Release 1.3.17:

## Bug Fixes and Other Changes
1.解决示例程序心跳设置不成功的问题
2.解决示例程序第二次调用抓拍不显示带掌纹框的抓拍图像的问题
3.更新算法版本
4.更新streamSDK版本
5.适配最新版本的streamSDK
6.更新client-sdk版本
## Submodule Versions
1. stream sdk v1.5.8
2. dim-palm sdk v1.1.6
3. client sdk v0.1.4

# palm-sdk Release 1.3.16:

## Bug Fixes and Other Changes
1. 删除stopdevice接口
2. 更新文档
3. 更新streamsdk版本
4. 根据编译选项分版本编译
## Submodule Versions
1. stream sdk v1.5.5

# palm-sdk Release 1.3.15:

## Bug Fixes and Other Changes
1. 将GetRecognitionThreshold接口移动到算法头文件中
2. 更新StreamSDK版本
3. 更新算法版本
4. 修改RegisterPalm接口入参默认值
5. 解决RegisterFrameCb接口无效问题
## Submodule Versions
1. stream sdk v1.5.3
2. dim-palm sdk v1.1.2

# palm-sdk Release 1.3.13:

## Bug Fixes and Other Changes
1. 打开静默升级
2. 更新StreamSDK版本
3. 更新算法版本
## Submodule Versions
1. stream sdk v1.5.0
2. dim-palm sdk v1.1.0

# palm-sdk Release 1.3.12:

## Bug Fixes and Other Changes
1. 更新算法版本
2. 更新CLientSDK版本
3. 删除一些无用接口
4. 修改一些接口和传参的名称
5. 添加最新的中文说明文档
## Submodule Versions
1. stream sdk v1.4.9
2. dim-palm sdk v1.0.42-encryption
3. ClientSdkVersion v0.1.3

# palm-sdk Release 1.3.10:

## Bug Fixes and Other Changes
1. 设置Android默认日志tag。
## Submodule Versions
1. stream sdk v1.4.9
2. dim-palm sdk v1.0.39-encryption

# palm-sdk Release 1.3.9:

## Bug Fixes and Other Changes
1. 图像提取特征值改为对应接口
## Submodule Versions
1. stream sdk v1.4.8
2. dim-palm sdk v1.0.39-encryption

# palm-sdk Release 1.3.8:

## Bug Fixes and Other Changes
1. 更新算法版本,解耦特征值加密和模型加密
2. 修改palm-client部分接口入参
## Submodule Versions
1. stream sdk v1.4.7
2. dim-palm sdk v1.0.39-encryption

# palm-sdk Release 1.3.7:

## Bug Fixes and Other Changes
1. 修改部分接口入参
## Submodule Versions
1. stream sdk v1.4.6
2. dim-palm sdk v1.0.38-encryption

# palm-sdk Release 1.3.6:

## Bug Fixes and Other Changes
1. 更新算法版本

## Submodule Versions
1. stream sdk v1.4.6
2. dim-palm sdk v1.0.38-encryption

# palm-sdk Release 1.3.5:

## Bug Fixes and Other Changes
1. 更新算法版本

## Submodule Versions
1. stream sdk v1.4.5
2. dim-palm sdk v1.0.37-encryption

# palm-sdk Release 1.3.4:

## Bug Fixes and Other Changes
1. 传出灯光模式

## Submodule Versions
1. stream sdk v1.4.4
2. dim-palm sdk v1.0.36-encryption

# palm-sdk Release 1.3.3:

## Bug Fixes and Other Changes
1. 增加驱动

## Submodule Versions
1. stream sdk v1.4.2
2. dim-palm sdk v1.0.36-encryption

# palm-sdk Release 1.3.2:

## Bug Fixes and Other Changes
1. 更新算法版本兼容 light status = 10的灯光状态

## Submodule Versions
1. stream sdk v1.4.2
2. dim-palm sdk v1.0.36-encryption

# palm-sdk Release 1.3.1:

## Bug Fixes and Other Changes
1. 更新算法版本，palm-sdk更新了palm-client头文件一些接口的参数定义类型

## Submodule Versions
1. stream sdk v1.4.1
2. dim-palm sdk v1.0.35-encryption

# palm-sdk Release 1.3.0:

## Bug Fixes and Other Changes
1. 更新算法版本

## Submodule Versions
1. stream sdk v1.4.0
2. dim-palm sdk v1.0.33-encryption

# palm-sdk Release 1.9.6:

## Bug Fixes and Other Changes
1. 更新palmclient返回错误码

## Submodule Versions
1. stream sdk v1.9.8
2. dim-palm sdk v1.0.30-encryption

# palm-sdk Release 1.9.7:

## Bug Fixes and Other Changes
1. 恢复抓拍回调输出特征值，palmclient的注册和查询接口传入2个特征值

## Submodule Versions
1. stream sdk v1.9.8
2. dim-palm sdk v1.0.30-encryption


# palm-sdk Release 1.9.8:

## Bug Fixes and Other Changes
1. 注释掉palm-client的一些静默升级等，添加了返回错误码等

## Submodule Versions
1. stream sdk v1.9.9
2. dim-palm sdk v1.0.29-encryption

# palm-sdk Release 1.9.9:

## Bug Fixes and Other Changes
1. 抓拍回调不输出特征值

## Submodule Versions
1. stream sdk v1.9.9
2. dim-palm sdk v1.0.29-encryption

# palm-sdk Release 1.2.4:

## Bug Fixes and Other Changes
1. 更新算法版本，修复多线程问题，修改了获取识别阈值接口

## Submodule Versions
1. stream sdk v1.3.5
2. dim-palm sdk v1.0.29-encryption

# palm-sdk Release 1.2.3:

## Bug Fixes and Other Changes
1. 增加比较特征值双模态

## Submodule Versions
1. stream sdk v1.3.4
2. dim-palm sdk v1.0.28-encryption

# palm-sdk Release 1.2.2:

## Bug Fixes and Other Changes
1. 修改提取特征值接口

## Submodule Versions
1. stream sdk v1.3.3
2. dim-palm sdk v1.0.27-encryption

# palm-sdk Release 1.2.1:

## Bug Fixes and Other Changes
1. 修改提取特征值接口

## Submodule Versions
1. stream sdk v1.3.0
2. dim-palm sdk v1.0.26-encryption

# palm-sdk Release 1.2.0:

## Bug Fixes and Other Changes
1. 集成palmclient 临时分支合入 适配dimpalm新接口

## Submodule Versions
1. stream sdk v1.3.0
2. dim-palm sdk v1.0.26-encryption

# palm-sdk Release 1.1.1:

## Bug Fixes and Other Changes
1. 抓拍回调结果为rgb ir两个特征值，setmode和获取支持分辨率 封装到sdk内部，只需要open即可

## Submodule Versions
1. stream sdk v1.2.9
2. dim-palm sdk v1.0.22-encryption

# palm-sdk Release 1.1.0:

## Bug Fixes and Other Changes
1. 更新compare参数类型接口

## Submodule Versions
1. stream sdk v1.2.6
2. dim-palm sdk v1.0.21-encryption


# palm-sdk Release 1.0.2:

## Bug Fixes and Other Changes
1. 更新dimpalm版本 比较输出特征值为加密

## Submodule Versions
1. stream sdk v1.2.6
2. dim-palm sdk v1.0.21-encryption


# palm-sdk Release 1.0.1:

## Bug Fixes and Other Changes
1. 增加注册接口，更新dimpalm算法，特征值提取为加密版本

## Submodule Versions
1. stream sdk v1.2.5
2. dim-palm sdk v1.0.20-encryption

# palm-sdk Release 1.0.0:

## Bug Fixes and Other Changes
1. 初次提交

## Submodule Versions
1. stream sdk v1.2.4
2. dim-palm sdk v1.0.17-encryption

