/* 

The x_ACCOUNT_ID and x_SUBSCRIPTION_ID info can be found in Zuora or Uplink organizations DynamoDB table.

Those values need to be replaced in the final file.

Last run 6/3/2019 - 6/13/2019

AND `created_at` >= '2019-06-14' AND `created_at` < '2019-07-08' 

AND `created_at` >= '2019-07-08' AND `created_at` < '2019-07-10' 

*/

/* TODO: generalize the set of orgs into a variable list i.e. array used in each select */

use uplink;

drop table if exists zuoralookups;

/* Subscribed Orgs List:
[ 'cbc-settlement-funding',
'asbestos.com',
'ar-systems',
'uproar',
'lunar',
'fortimize',
'weitz-and-lux',
'salesforce-se-demo',
'spekit',
'chorus',
'emburse',
'aqp' ]
*/
/* WHERE `organization_id` IN ('cbc-settlement-funding', 'asbestos.com', 'ar-systems', 'aqp', 'uproar', 'lunar', 'fortimize', 'weitz-and-lux', 'salesforce-se-demo', 'spekit', 'chorus', 'emburse') */

create  table zuoralookups
(orgid varchar(50) , accountid varchar(50), subscriptionid varchar(50), orgname varchar(50), primary key(orgid));

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('lunar','A00000007','A-S00000001', 'Lunar');

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('ar-systems','A00000122','A-S00000052', 'AR Systems');

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('aqp','A00000069','A-S00000047', 'AQP');

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('cbc-settlement-funding','A00000025','A-S00000008', 'CBC Settlement Funding');

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('fortimize','A00000077','A-S00000027', 'Fortimize');

/* Changed to A-S00000012 on 6/17/2019 per R. Rodriguez */
/* This has not yet been updated in the DynamoDB */
/* A-S00000005 */
insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('weitz-and-lux','A00000019','A-S00000012', 'Weitz and Lux');

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('asbestos.com','A00000070','A-S00000029', 'Asbestos.com');

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('uproar','A00000061','A-S00000022', 'Uproar');

/* insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('canndescent','A00000000','A-S00000030', 'Canndescent'); */

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('spekit','A00000044','A-S00000016', 'Spekit');

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('chorus','A00000015','A-S00000004', 'Chorus');

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('emburse','A00000048','A-S00000017', 'Emburse');

insert into zuoralookups (orgid, accountid, subscriptionid, orgname) values
('salesforce-se-demo','A00000039','A-S00000015', 'Salesforce SE Demo');


SELECT 
/* CONCAT(organization_id, '_ACCOUNT_ID') AS ACCOUNT_ID, */
/*organization_id,*/
 z.accountid as ACCOUNT_ID,
 'Media' AS UOM,
 SUM(billable_units) AS QTY,
 DATE_FORMAT(messages.created_at, '%m-%d-%Y') AS STARTDATE,
 DATE_FORMAT(messages.created_at, '%m-%d-%Y') AS ENDDATE,
/* CONCAT(organization_id, '_SUBSCRIPTION_ID') AS SUBSCRIPTION_ID,*/
 z.subscriptionid as SUBSCRIPTION_ID,
 '' AS CHARGE_ID,
 /*CONCAT('Uplink media messages used by the ', organization_id, '_ORG_NAME organization.') AS DESCRIPTION*/
 CONCAT('Uplink media messages used by the ', z.orgname, ' organization.') as DESCRIPTION
FROM `messages` 
left join `zuoralookups` z on z.orgid = organization_id 
WHERE `organization_id` IN ('cbc-settlement-funding', 'asbestos.com', 'ar-systems', 'aqp', 'uproar', 'lunar', 'fortimize', 'weitz-and-lux', 'salesforce-se-demo', 'spekit', 'chorus', 'emburse')
AND `created_at` >= '2019-08-02' AND `created_at` < '2019-08-03'  
AND `type` = 'USER' 
AND `media` IS NOT NULL AND `media` != '[]'
 GROUP BY `STARTDATE`,`organization_id`,z.accountid, z.orgid

 UNION
 
 SELECT 
 /*CONCAT(organization_id, '_ACCOUNT_ID') AS ACCOUNT_ID,*/
 /* organization_id, */
 z2.accountid as ACCOUNT_ID,
 'SMS' AS UOM,
 SUM(billable_units) AS QTY,
 DATE_FORMAT(messages.created_at, '%m-%d-%Y') AS STARTDATE,
 DATE_FORMAT(messages.created_at, '%m-%d-%Y') AS ENDDATE,
 /*CONCAT(organization_id, '_SUBSCRIPTION_ID') AS SUBSCRIPTION_ID,*/
 z2.subscriptionid as SUBSCRIPTION_ID,
 '' AS CHARGE_ID,
/*CONCAT('Uplink SMS messages used by the ', organization_id, '_ORG_NAME organization.') AS DESCRIPTION*/
 CONCAT('Uplink SMS messages used by the ', z2.orgname, ' organization.') as DESCRIPTION
FROM `messages` 
left join `zuoralookups` z2 on z2.orgid = organization_id
WHERE `organization_id` IN ('cbc-settlement-funding', 'asbestos.com', 'ar-systems', 'aqp', 'uproar', 'lunar', 'fortimize', 'weitz-and-lux', 'salesforce-se-demo', 'spekit', 'chorus', 'emburse') 
AND `created_at` >= '2019-08-02' AND `created_at` < '2019-08-03' 
AND `type` = 'USER' AND `media` = '[]'
 GROUP BY `STARTDATE`,`organization_id`,z2.accountid, z2.orgid
 
 UNION 
 
 SELECT 
 /* CONCAT(organization_id, '_ACCOUNT_ID') AS ACCOUNT_ID,*/
 /* organization_id, */
 z3.accountid as ACCOUNT_ID,
 'Minutes' AS UOM,
/*  SUM(billable_units) AS QTY, */
/* Temporary because billable units are 0 as of Fish and Chips for calls */
  sum(CEILING(duration/60.0)) As QTY,
 DATE_FORMAT(messages.created_at, '%m-%d-%Y') AS STARTDATE,
 DATE_FORMAT(messages.created_at, '%m-%d-%Y') AS ENDDATE,
 /*CONCAT(organization_id, '_SUBSCRIPTION_ID') AS SUBSCRIPTION_ID,*/
 z3.subscriptionid as SUBSCRIPTION_ID,
 '' AS CHARGE_ID,
 /* CONCAT('Uplink voice minutes used by the ', organization_id, '_ORG_NAME organization.') AS DESCRIPTION */
 CONCAT('Uplink voice minutes used by the ', z3.orgname, ' organization.') as DESCRIPTION
FROM `messages` 
left join `zuoralookups` z3 on z3.orgid = organization_id
WHERE `organization_id` IN ('cbc-settlement-funding', 'asbestos.com', 'ar-systems', 'aqp', 'uproar', 'lunar', 'fortimize', 'weitz-and-lux', 'salesforce-se-demo', 'spekit', 'chorus', 'emburse') 
AND `created_at` >= '2019-08-02' AND `created_at` < '2019-08-03' 
AND `type` = 'CALL' 
GROUP BY `STARTDATE`,`organization_id`,z3.accountid, z3.orgid

order by UOM, ACCOUNT_ID;

/*
select 
CEILING(m.duration/60.0),
 m.duration
from `messages` m
where m.`created_at` >= '2019-06-03' AND m.`created_at` < '2019-06-14' 
AND m.`type` = 'CALL' 
*/

