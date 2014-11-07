var fs = require('fs');

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
                ThisThat.hasMany(models.Vote, {onDelete: 'cascade'});
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

    ThisThat.hook('afterDestroy', function(thisthat, fn) {
        var image1_path = 'public' + thisthat.image_1;
        var image2_path = 'public' + thisthat.image_2;

        fs.unlink(image1_path);
        fs.unlink(image2_path);

        return fn();
    });

    return ThisThat
}
