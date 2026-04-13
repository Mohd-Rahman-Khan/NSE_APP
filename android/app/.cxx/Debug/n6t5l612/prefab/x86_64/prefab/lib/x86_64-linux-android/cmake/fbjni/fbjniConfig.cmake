if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "/Users/mohdrahmankhan/.gradle/caches/8.14.1/transforms/57e8495136fbda90fd3a9eaf56bd49cc/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/libs/android.x86_64/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/mohdrahmankhan/.gradle/caches/8.14.1/transforms/57e8495136fbda90fd3a9eaf56bd49cc/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

