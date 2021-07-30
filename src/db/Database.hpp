#pragma once

#include "dto/ReplayDto.hpp"
#include "db/ReplayDb.hpp"

#include "oatpp-mongo/bson/mapping/ObjectMapper.hpp"

#include <mongocxx/pool.hpp>
#include <bsoncxx/document/value.hpp>

#include "oatpp-mongo/bson/Types.hpp"
#include "oatpp/encoding/Hex.hpp"
#include "oatpp/core/data/stream/BufferStream.hpp"

namespace db {

    class Database {
    private:
        std::shared_ptr<mongocxx::pool> pool;
        std::string databaseName;
        std::string collectionName;
        oatpp::mongo::bson::mapping::ObjectMapper objectMapper;
    private:
        oatpp::Object<ReplayDb> replayFromDto(const oatpp::Object<ReplayDto>& replayDto);
        oatpp::Object<ReplayDto> dtoFromReplay(const oatpp::Object<ReplayDb>& replayDb);
    private:
        bsoncxx::document::value createMongoDocument(const oatpp::Void& polymorph);
        oatpp::mongo::bson::ObjectId objectIdFromString(const oatpp::String& hexText);
    public:

        Database(const mongocxx::uri& uri, const std::string& dbName, const std::string& collectionName);

        oatpp::Object<ReplayDto> createReplay(const oatpp::Object<ReplayDto>& replayDto);
        oatpp::Object<ReplayDto> getReplay(const oatpp::String& id);
        oatpp::Object<ReplayDto> getReplayDataElement(const oatpp::String& id, const oatpp::UInt32 index, const oatpp::UInt32 amount = 1);

        oatpp::List<oatpp::Object<ReplayDto>> getAllReplays();

        bool deleteReplay(const oatpp::String& replayId);
    };
}

