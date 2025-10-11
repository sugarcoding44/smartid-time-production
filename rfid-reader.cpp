#include <iostream>
#include <windows.h>
#include <string>
#include <json/json.h>

// X-Telcom RFID1356.dll function definitions
typedef int (*InitializeReader)();
typedef int (*ConnectReader)();
typedef int (*DisconnectReader)();
typedef int (*ReadCardUID)(char* uid, int maxLen);
typedef int (*IsCardPresent)();

class XTelcomRFIDReader {
private:
    HINSTANCE hDLL;
    InitializeReader initialize;
    ConnectReader connect;
    DisconnectReader disconnect;
    ReadCardUID readUID;
    IsCardPresent isCardPresent;
    bool connected;

public:
    XTelcomRFIDReader() : hDLL(nullptr), connected(false) {}
    
    ~XTelcomRFIDReader() {
        if (connected) {
            Disconnect();
        }
        if (hDLL) {
            FreeLibrary(hDLL);
        }
    }

    bool LoadDLL(const std::string& dllPath) {
        hDLL = LoadLibraryA(dllPath.c_str());
        if (!hDLL) {
            std::cerr << "Failed to load RFID1356.dll" << std::endl;
            return false;
        }

        // Load functions from DLL
        initialize = (InitializeReader)GetProcAddress(hDLL, "InitializeReader");
        connect = (ConnectReader)GetProcAddress(hDLL, "ConnectReader");
        disconnect = (DisconnectReader)GetProcAddress(hDLL, "DisconnectReader");
        readUID = (ReadCardUID)GetProcAddress(hDLL, "ReadCardUID");
        isCardPresent = (IsCardPresent)GetProcAddress(hDLL, "IsCardPresent");

        if (!initialize || !connect || !disconnect || !readUID || !isCardPresent) {
            std::cerr << "Failed to load required functions from DLL" << std::endl;
            FreeLibrary(hDLL);
            hDLL = nullptr;
            return false;
        }

        return true;
    }

    bool Initialize() {
        if (!hDLL) return false;
        return initialize() == 0;
    }

    bool Connect() {
        if (!hDLL) return false;
        if (connect() == 0) {
            connected = true;
            return true;
        }
        return false;
    }

    void Disconnect() {
        if (hDLL && connected) {
            disconnect();
            connected = false;
        }
    }

    std::string ReadCard() {
        if (!hDLL || !connected) return "";
        
        char uid[64] = {0};
        if (readUID(uid, sizeof(uid)) == 0) {
            return std::string(uid);
        }
        return "";
    }

    bool CardPresent() {
        if (!hDLL || !connected) return false;
        return isCardPresent() == 1;
    }
};

int main(int argc, char* argv[]) {
    XTelcomRFIDReader reader;
    
    // Path to your RFID1356.dll
    std::string dllPath = "C:\\Users\\user\\Downloads\\NTAG424_SDK\\NTAG424  Tag SDK and demo\\ntag424 function 1 SDK 20240722\\RFID1356.dll";
    
    if (!reader.LoadDLL(dllPath)) {
        std::cerr << "Failed to load X-Telcom SDK" << std::endl;
        return 1;
    }

    if (!reader.Initialize()) {
        std::cerr << "Failed to initialize reader" << std::endl;
        return 1;
    }

    if (!reader.Connect()) {
        std::cerr << "Failed to connect to XT-N424 WR" << std::endl;
        return 1;
    }

    std::cout << "XT-N424 WR connected successfully!" << std::endl;
    std::cout << "Waiting for cards..." << std::endl;

    // Main loop - poll for cards
    std::string lastUID = "";
    while (true) {
        if (reader.CardPresent()) {
            std::string uid = reader.ReadCard();
            if (!uid.empty() && uid != lastUID) {
                lastUID = uid;
                
                // Output JSON for easy parsing by web app
                Json::Value cardData;
                cardData["uid"] = uid;
                cardData["timestamp"] = (int64_t)time(nullptr);
                cardData["type"] = "ntag424";
                
                Json::StreamWriterBuilder builder;
                std::string jsonString = Json::writeString(builder, cardData);
                
                std::cout << "CARD_DETECTED:" << jsonString << std::endl;
            }
        } else {
            if (!lastUID.empty()) {
                std::cout << "CARD_REMOVED" << std::endl;
                lastUID = "";
            }
        }
        
        Sleep(500); // Poll every 500ms
    }

    return 0;
}