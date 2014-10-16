module.exports = function(sequelize, DataTypes) {
    var Vote = sequelize.define('Vote', {
        vote: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
            },
            tableName: 'votes'
        }
    });

    return Vote
};