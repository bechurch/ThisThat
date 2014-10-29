module.exports = function(sequelize, DataTypes) {
    var Token = sequelize.define('Token', {
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        expired_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        classMethods: {
            associate: function(models) {
            },
            tableName: 'token'
        }
    });

    return Token
};