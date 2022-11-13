const db = require(".");
module.exports = (sequelize, DataTypes) => {
        const Berat = sequelize.define(
        "beratusers",
        {   
            id_berat : {
                allowNull : false,
                type: DataTypes.INTEGER,
                autoIncrement : true,
                primaryKey: true,
            },
            id_users: {
                type: DataTypes.INTEGER,
               
                
            },

            berat : {
                type : DataTypes.DOUBLE,
            }
        
        },
        {
            timestamps: false,
        },
        
    )
    return Berat;   

};

