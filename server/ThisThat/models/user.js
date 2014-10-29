module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        phone_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.ThisThat);
                User.hasMany(models.Vote);
                User.hasMany(models.Token);
            },
            tableName: 'users'
        }
    });

    return User
};