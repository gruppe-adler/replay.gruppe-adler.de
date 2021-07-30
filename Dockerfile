FROM alpine:latest as build

LABEL description="Build container - replay-service"

RUN echo "@testing http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories

RUN apk update && apk add --no-cache \ 
   alpine-sdk tar curl zip unzip cmake ninja zlib-dev perl mongo-cxx-driver-dev@testing mongo-c-driver-dev@testing snappy-dev openssl-dev zstd-dev

RUN cd /tmp \
    && git clone https://github.com/Microsoft/vcpkg.git -n \ 
    && cd vcpkg \
    && git checkout 4990d2b9510876531eb7e73eeba09210178e804f \
    && ./bootstrap-vcpkg.sh -useSystemBinaries

COPY utility/x64-linux-musl.cmake /tmp/vcpkg/triplets/

RUN VCPKG_FORCE_SYSTEM_BINARIES=1 ./tmp/vcpkg/vcpkg install zlib
RUN VCPKG_FORCE_SYSTEM_BINARIES=1 ./tmp/vcpkg/vcpkg install oatpp oatpp-swagger oatpp-mongo oatpp-zlib

RUN mkdir /tmp/build

WORKDIR /tmp/build

COPY ./CMakeLists.txt ./CMakeLists.txt
COPY ./src ./src
COPY ./static ./static

RUN mkdir ./out \
    && cd ./out \
    && cmake .. \
    -DCMAKE_TOOLCHAIN_FILE=/tmp/vcpkg/scripts/buildsystems/vcpkg.cmake \
    -DVCPKG_TARGET_TRIPLET=x64-linux-musl \
    -DCMAKE_INSTALL_PREFIX=/build/install \
    #-DUSE_STATIC_LINKING=ON \
    -DCMAKE_BUILD_TYPE=Release \

    && make \
    && make install

#RUN cd .
#RUN ls -la /build/install
#RUN ls -la /build/install/service
#RUN ls -la /build/install/service/res
#RUN ls -lha /build/install/service/static

FROM alpine:latest as runtime

LABEL description="Run container - replay-service"

RUN echo "@testing http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories

RUN apk update && apk add --no-cache \ 
    libstdc++ mongo-cxx-driver-dev@testing mongo-c-driver-dev@testing

RUN mkdir /usr/local/service

COPY --from=build /build/install/service/replay-service /usr/local/service/replay-service
COPY --from=build /build/install/service/res /usr/local/service/res
COPY --from=build /build/install/service/static /usr/local/service/static

WORKDIR /usr/local/service

#RUN ls -la .
#RUN ls -la ./static
#RUN pwd
EXPOSE 8000 8000

ENTRYPOINT ["./replay-service"]

