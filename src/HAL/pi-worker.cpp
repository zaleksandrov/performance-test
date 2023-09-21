#include <napi.h>
#include "pi-worker.h"  // NOLINT(build/include)
#include <math.h>
#include <iostream>
using namespace std;

struct GPSData {
    double longitude;
    double latitude;
    double altitude;
    GPSData(double longitude, double latitude, double altitude)
    : longitude(longitude),latitude(latitude),altitude(altitude){}
};

struct Vector3 {
    double x;
    double y;
    double z;
    Vector3(double x = -1.0, double y = -1.0, double z = -1.0)
    : x(x),y(y),z(z){}
};

double semiMajorAxis = 6378137.0;
double semiMinorAxis = 6356752.3142;
double semiAxisRatioSqr = (semiMinorAxis * semiMinorAxis) / (semiMajorAxis * semiMajorAxis);
double ellipsoidFlattening = 1 / 298.257223563;

double calculateAuxiliaryVariable(double latitude) {
     return semiMajorAxis / sqrt(1 - ellipsoidFlattening * (2 - ellipsoidFlattening) * pow(sin(latitude), 2));
}

class PiWorker : public Napi::AsyncWorker {
public:
    PiWorker(Napi::Env &env, GPSData gpsData)
            : Napi::AsyncWorker(env), gpsData(gpsData), result(Vector3()), deferred(Napi::Promise::Deferred::New(env)) {}

    ~PiWorker() {}

    // Executed inside the worker-thread.
    // It is not safe to access JS engine data structure
    // here, so everything we need for input and output
    // should go on `this`.
    void Execute() {
        auto N = calculateAuxiliaryVariable(gpsData.latitude);

        auto cosLat = cos(gpsData.latitude);
        auto cosLong = cos(gpsData.longitude);
        auto sinLong = sin(gpsData.longitude);
        auto sinLat = sin(gpsData.latitude);

        auto x = (N + gpsData.altitude) * cosLat * cosLong;
        auto y = (N + gpsData.altitude) * cosLat * sinLong;
        auto z = (semiAxisRatioSqr * N + gpsData.altitude) * sinLat;

        result = Vector3(x,y,z);
        // you could handle errors as well
        // throw std::runtime_error("test error");
        // or like
        // Napi::AsyncWorker::SetError
        // Napi::AsyncWorker::SetError("test error");
    }

    // Executed when the async work is complete
    // this function will be run inside the main event loop
    // so it is safe to use JS engine data again
    void OnOK() {
        auto resultObjectJS = Napi::Object::New(Env());
        resultObjectJS.Set("x", result.x);
        resultObjectJS.Set("y", result.y);
        resultObjectJS.Set("z", result.z);
        deferred.Resolve(resultObjectJS);
    }

    void OnError(Napi::Error const &error) {
        deferred.Reject(error.Value());
    }

    Napi::Promise GetPromise() { return deferred.Promise(); }

private:
    GPSData gpsData;
    Vector3 result;
    Napi::Promise::Deferred deferred;
};
namespace example {
    Napi::Value CalculatePiAsync(const Napi::CallbackInfo &info) {
        Napi::Env env = info.Env();
        cout << "Hey from c++" << endl;
        auto points = info[0].As<Napi::Object>();
        double longitude = points.Get("longitude").As<Napi::Number>().DoubleValue();
        double latitude = points.Get("latitude").As<Napi::Number>().DoubleValue();
        double altitude = points.Get("altitude").As<Napi::Number>().DoubleValue();

        PiWorker *piWorker = new PiWorker(env, GPSData(longitude, latitude, altitude));
        auto promise = piWorker->GetPromise();

        piWorker->Queue();

        return promise;
    }
}