module.exports = function(sequelize, DataTypes) {
    var Vote = sequelize.define('Vote', {
        vote: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Vote.belongsTo(models.User, {foreignKey: 'userId', as: 'user'});
                Vote.belongsTo(models.ThisThat, {foreignKey: 'thisthatId', as: 'thisthat'});
            },
            tableName: 'votes'
        }
    });

    return Vote
};