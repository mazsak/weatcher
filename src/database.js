import SQLite from "react-native-sqlite-storage";

var db = SQLite.openDatabase({ name: 'Weather.db' });

export default db;