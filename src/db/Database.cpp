
#include "Database.hpp"

#include "oatpp/core/data/stream/BufferStream.hpp"

#include <mongocxx/client.hpp>
#include <mongocxx/options/insert.hpp>
#include <mongocxx/exception/operation_exception.hpp>
#include <mongocxx/exception/bulk_write_exception.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/types.hpp>

#include <oatpp-mongo/bson/type/ObjectId.hpp>

namespace db {

    Database::Database(const mongocxx::uri& uri, const std::string& dbName, const std::string& collectionName)
        : pool(std::make_shared<mongocxx::pool>(uri)), databaseName(dbName), collectionName(collectionName)
    {}

    bsoncxx::document::value Database::createMongoDocument(const oatpp::Void& polymorph) {
        // if you have huge docs, you may want to increase starting BufferOutputStream size.
        // Or you may want to use oatpp::data::stream::ChunkedBuffer instead - for no-copy growth.
        oatpp::data::stream::BufferOutputStream stream;
        objectMapper.write(&stream, polymorph);
        bsoncxx::document::view view(stream.getData(), stream.getCurrentPosition());
        return bsoncxx::document::value(view);
    }

    oatpp::Object<ReplayDto> Database::createReplay(const oatpp::Object<ReplayDto>& replayDto) {
        auto conn = pool->acquire();
        auto collection = (*conn)[databaseName][collectionName];

        auto ret = replayFromDto(replayDto);
        collection.insert_one(createMongoDocument(ret));
        return dtoFromReplay(ret);

    }

    oatpp::Object<ReplayDb> Database::replayFromDto(const oatpp::Object<ReplayDto>& replayDto) {
        auto replay = ReplayDb::createShared();

        //replay->_id = oatpp::mongo::bson::ObjectId(bsoncxx::oid().bytes());
            
        //replay->_id = oatpp::mongo::bson::ObjectId().

        if (replayDto->id != nullptr && replayDto->id->getSize() == 12) {
            replay->_id = objectIdFromString(replayDto->id);
        }
        else {
            replay->_id = oatpp::mongo::bson::type::ObjectId();
            replay->id = replay->_id->toString();
        }
        replay->config = replayDto->config;
        replay->data = replayDto->data;
        replay->date = replayDto->date;
        replay->duration = replayDto->duration;
        replay->frameCount = replayDto->frameCount;
        replay->missionName = replayDto->missionName;
        replay->worldName = replayDto->worldName;
        
        return replay;
    }

    oatpp::Object<ReplayDto> Database::dtoFromReplay(const oatpp::Object<ReplayDb>& replayDb) {
        auto replay = ReplayDto::createShared();

        //replay->id = replayDb->_id.get();
        replay->id = replayDb->id;
        replay->config = replayDb->config;
        replay->data = replayDb->data;
        replay->date = replayDb->date;
        replay->duration = replayDb->duration;
        replay->frameCount = replayDb->frameCount;
        replay->missionName = replayDb->missionName;
        replay->worldName = replayDb->worldName;

        /* auto dto = UserDto::createShared();
         dto->username = user->username;
         dto->active = user->active;
         dto->role = user->role;*/
        return replay;
    }

    oatpp::Object<ReplayDto> Database::getReplay(const oatpp::String& id) {
        auto conn = pool->acquire();
        auto collection = (*conn)[databaseName][collectionName];

        auto result =
            collection.find_one(createMongoDocument( // <-- Filter
                oatpp::Fields<oatpp::Any>({
                  {"_id", objectIdFromString(id) }
                    })
            ));

        if (result) {
            auto view = result->view();
            auto bson = oatpp::String((const char*)view.data(), view.length(), false /* to not copy view data */);
            auto replay = objectMapper.readFromString<oatpp::Object<ReplayDb>>(bson);
            return dtoFromReplay(replay);
        }

        return nullptr;
    }

    oatpp::mongo::bson::ObjectId Database::objectIdFromString(const oatpp::String& hexText) {
        oatpp::data::stream::BufferOutputStream stream(12);
        oatpp::encoding::Hex::decode(&stream, hexText->getData(), hexText->getSize(), false);
        if (stream.getCurrentPosition() != 12) {
            throw std::runtime_error("Error. Invalid string.");
        }
        return oatpp::mongo::bson::ObjectId(stream.getData());
    }

    // {_id: 1, data : { $slice: [2, 1]}}

    oatpp::Object<ReplayDto> Database::getReplayDataElement(const oatpp::String& id, const oatpp::UInt32 index, const oatpp::UInt32 amount) {
        auto conn = pool->acquire();
        auto collection = (*conn)[databaseName][collectionName];

        oatpp::Vector<oatpp::UInt32> sliceParams = { index, amount };

        auto projection = mongocxx::options::find().projection(
            createMongoDocument(
                oatpp::Fields<oatpp::Any>({
                    { "_id", (oatpp::Int32)1 },
                    {
                        "data", oatpp::Fields<oatpp::Any>({
                            { "$slice", sliceParams }
                        })
                    }
                })
            )
        );

        auto result =
            collection.find_one(createMongoDocument(
                oatpp::Fields<oatpp::Any>({ 
                    {"_id", objectIdFromString(id) }
                })
            ), projection);


        if (result) {
            auto view = result->view();
            auto bson = oatpp::String((const char*)view.data(), view.length(), false /* to not copy view data */);
            auto replay = objectMapper.readFromString<oatpp::Object<ReplayDb>>(bson);
            return dtoFromReplay(replay);
        }

        return nullptr;
    }


    oatpp::List<oatpp::Object<ReplayDto>> Database::getAllReplays() {
        auto conn = pool->acquire();
        auto collection = (*conn)[databaseName][collectionName];

        auto cursor = collection.find(
            createMongoDocument(oatpp::Fields<oatpp::String>({})
            ));

        oatpp::List<oatpp::Object<ReplayDto>> list({});

        for (auto view : cursor) {
            auto bson = oatpp::String((const char*)view.data(), view.length(), false /* to not copy view data */);
            auto replay = objectMapper.readFromString<oatpp::Object<ReplayDb>>(bson);
            list->push_back(dtoFromReplay(replay));
        }

        return list;

    }

    bool Database::deleteReplay(const oatpp::String& replayId) {
        auto conn = pool->acquire();
        auto collection = (*conn)[databaseName][collectionName];

        auto result =
            collection.delete_one(createMongoDocument(
                oatpp::Fields<oatpp::Any>({
                  {"_id", objectIdFromString(replayId)}
                    })
            ));

        if (result) {
            return result->deleted_count() == 1;
        }
        return false;
    }

}

