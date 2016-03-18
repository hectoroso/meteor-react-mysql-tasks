# meteor-react-mysql
Testing meteor, react and mysql together using the Tasks app from the [Meteor-React tutorial](https://www.meteor.com/tutorials/react/creating-an-app). The tutorial repository is [here](https://github.com/meteor/simple-todos-react). It requires the [numtel:mysql](https://github.com/numtel/meteor-mysql) package.

---
## Setup Meteor code ##
Information on installing Meteor is [here](https://www.meteor.com/install). Then run the following:

    git clone https://github.com/hectoroso/meteor-react-mysql-tasks.git
    meteor create meteor-react-mysql-tasks
    cd meteor-react-mysql-tasks/
    meteor remove autopublish
    meteor remove insecure
    meteor add accounts-ui accounts-password
    meteor add react
    meteor add numtel:mysql

---
## MySQL ##
Add or uncomment the following from your my.cnf (location depends on installation and platform) to ensure it's outputing a binary log. More info on setting up MySql [here](https://github.com/numtel/mysql-live-select).

    server-id = 1
    log_bin = /var/log/mysql/mysql-bin.log
    expire_logs_days = 10
    max_binlog_size = 100M

* Restart mysql.

* Edit settings.json based on your mysql settings

* Run tasks.sql on MySQL server

Run the following in mysql:

    GRANT REPLICATION SLAVE, REPLICATION CLIENT, SELECT ON *.* TO 'root'@'%';

---
## Startup meteor server ##

    meteor –-settings settings.json