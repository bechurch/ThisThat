module.exports = function(sequelize, DataTypes) {
    var Friend = sequelize.define('Friend', {

    }, {
        classMethods: {
            associate: function(models) {
                Friend.belongsTo(models.User, {foreignKey: 'userId', as: 'user'});
                Friend.belongsTo(models.ThisThat, {foreignKey: 'friendId', as: 'friend'});
            },
            tableName: 'friends'
        }
    });

    return Friend
};