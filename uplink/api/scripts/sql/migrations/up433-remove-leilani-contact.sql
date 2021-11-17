# This script was executed on 2019-09-27 to correct contacts to users in the lunar org
# This script is entirely unrelated to knex and objections.js and was executed to resolve
# an issue in the production org.

# Workbench requires safe updates have the primary key. Turn this off
# We are smart enough to know which records to alter.
SET SQL_SAFE_UPDATES = 0;

# Get the actual record primary key associated with the affected user numbers.
SET @user_id_1 :=(select `id` from users where organization_id='lunar' and `physicalNumber`= '+12282382714');

# Sets both relevant users from the 'CONTACT' type to 'USER'
# The notion here is there "shouldn't" be a problem changing the user type
UPDATE users 
SET    type = 'USER' ,
	name = 'Leilani Figueras'
WHERE  organization_id = 'lunar' 
	AND `id` in (@user_id_1); 

# There are several things going on here:
# I don't want to delete records in the database. They're uniquely
# identified and potentially depended on. The system number
# is a string and can be renamed. Queries to uplink/api will assume
# lookups on properly formatted numbers.
# Queries on user type such as contact will expect the type to be
# 'CONTACT'.
# Queries on who is using this number will expect a user's ID.
UPDATE phonenumbers 
SET    systemnumber = '+13097402645nan', 
       type = 'RECYCLED', 
       user_id = NULL
WHERE  organization_id = 'lunar' 
       AND user_id = @user_id_1;

# Be sure to turn this back on
SET SQL_SAFE_UPDATES = 1;
