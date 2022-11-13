const db = require(".");
 module.exports = (sequelize, DataTypes) => {
     const User = sequelize.define(
        "users",
        {
            id: {
                allowNull : false,
                type: DataTypes.INTEGER,
                autoIncrement : true,
                primaryKey: true,
            },
            fullname : {
                type: DataTypes.STRING,
            },
            password: {
                type: DataTypes.STRING,
               
            },
            email: {
                type : DataTypes.STRING,
            },

        }, 
        {
            timestamps: false,
        }
        
        
        

    );    
    return User;
 
};


