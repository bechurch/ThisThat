module.exports = function(sequelize, DataTypes) {
    var ThisThat = sequelize.define('ThisThat', {
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        expires_at: DataTypes.DATE,
        message: DataTypes.STRING,
        image_1: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image_2: {
            type: DataTypes.STRING,
            allowNull: false
        },
        vote_count_1: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        vote_count_2: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        }


    }, {
        classMethods: {
            associate: function(models) {
                ThisThat.belongsTo(models.User);
                ThisThat.hasMany(models.Vote);
            }

        },
        instanceMethods: {
            hasUser: function(user) {
                if (user.id === this.userId) {
                    return true;
                }
                else return false
            }
        },
        tableName: 'thisthat'
    });

    return ThisThat
}
