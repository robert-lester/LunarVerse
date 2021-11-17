# Schema Types

<details>
  <summary><strong>Table of Contents</strong></summary>

  * [Query](#query)
  * [Objects](#objects)
    * [BasePlan](#baseplan)
    * [Breakdown](#breakdown)
    * [BreakdownByPhone](#breakdownbyphone)
    * [Conversation](#conversation)
    * [DailyMessageBreakdown](#dailymessagebreakdown)
    * [DailyVoiceBreakdown](#dailyvoicebreakdown)
    * [Invite](#invite)
    * [Message](#message)
    * [Mutation](#mutation)
    * [PhoneNumber](#phonenumber)
    * [Plan](#plan)
    * [Report](#report)
    * [TotalBreakdown](#totalbreakdown)
    * [TotalBreakdownByCategory](#totalbreakdownbycategory)
    * [TotalBreakdownByVoice](#totalbreakdownbyvoice)
    * [TotalsBreakdown](#totalsbreakdown)
    * [Usage](#usage)
    * [UsageBreakdown](#usagebreakdown)
    * [User](#user)
  * [Enums](#enums)
    * [AssignedType](#assignedtype)
    * [PhoneType](#phonetype)
    * [SortOptions](#sortoptions)
    * [UserType](#usertype)
  * [Scalars](#scalars)
    * [Boolean](#boolean)
    * [Date](#date)
    * [Float](#float)
    * [ID](#id)
    * [Int](#int)
    * [PhoneString](#phonestring)
    * [String](#string)
  * [Interfaces](#interfaces)
    * [Node](#node)

</details>

## Query 
The dummy queries and mutations are necessary because
graphql-js cannot have empty root types and we only extend
these types later on
Ref: apollographql/graphql-tools#293

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>dummy</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getConversation</strong></td>
<td valign="top"><a href="#conversation">Conversation</a></td>
<td>

Gets a single conversation by ID

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getConversations</strong></td>
<td valign="top">[<a href="#conversation">Conversation</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phoneNumbers</td>
<td valign="top">[<a href="#string">String</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#daterange">DateRange</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortoptions">SortOptions</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getInvite</strong></td>
<td valign="top"><a href="#invite">Invite</a></td>
<td>

Gets a single invite by ID

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getMessage</strong></td>
<td valign="top"><a href="#message">Message</a></td>
<td>

Gets a single message by ID

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getMessages</strong></td>
<td valign="top">[<a href="#message">Message</a>]</td>
<td>

Gets a list of messages by ID

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">ids</td>
<td valign="top">[<a href="#int">Int</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getPhoneNumber</strong></td>
<td valign="top"><a href="#phonenumber">PhoneNumber</a></td>
<td>

Gets a single phone number

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phoneNumber</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getPhoneNumbers</strong></td>
<td valign="top">[<a href="#phonenumber">PhoneNumber</a>]</td>
<td>

Gets all phone numbers in the system

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phoneNumbers</td>
<td valign="top">[<a href="#int">Int</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#phonetype">PhoneType</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#assignedtype">AssignedType</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getPhoneNumberMessages</strong></td>
<td valign="top">[<a href="#message">Message</a>]</td>
<td>

Get all messages of a phone number

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phoneNumber</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#datefilters">DateFilters</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getPhoneNumberConversations</strong></td>
<td valign="top">[<a href="#conversation">Conversation</a>]</td>
<td>

Get all conversations of a phone number

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phoneNumber</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#datefilters">DateFilters</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getPlan</strong></td>
<td valign="top"><a href="#plan">Plan</a>!</td>
<td>

Get the billing activity

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>search</strong></td>
<td valign="top">[<a href="#searchable">Searchable</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">search</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getUsage</strong></td>
<td valign="top"><a href="#usage">Usage</a>!</td>
<td>

Get the usage by account ID

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">dateRange</td>
<td valign="top"><a href="#daterange">DateRange</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phoneNumbers</td>
<td valign="top">[<a href="#string">String</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getUser</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

Get a single user by ID

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getUserBySystemPhone</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

Get a single user by system phone number

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phoneNumber</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getUserByPhysicalPhone</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

Get a singel user by physical number

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phoneNumber</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getUsers</strong></td>
<td valign="top">[<a href="#user">User</a>]</td>
<td>

Get all users

</td>
</tr>
</tbody>
</table>

## Objects

### BasePlan

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>price</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>numbers</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sms</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>mediaMessages</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>minutes</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>contacts</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
</tbody>
</table>

### Breakdown

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#dailymessagebreakdown">DailyMessageBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>voice</strong></td>
<td valign="top"><a href="#dailyvoicebreakdown">DailyVoiceBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>phoneNumbers</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### BreakdownByPhone

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>systemNumber</strong></td>
<td valign="top"><a href="#phonestring">PhoneString</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#dailymessagebreakdown">DailyMessageBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>voice</strong></td>
<td valign="top"><a href="#dailyvoicebreakdown">DailyVoiceBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>phoneNumbers</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### Conversation

A conversation object containing all message contents

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>organization_id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td>

Organization identifier

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>phoneNumbers</strong></td>
<td valign="top">[<a href="#phonenumber">PhoneNumber</a>!]!</td>
<td>

System phone number involved in the conversation

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>created_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updated_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>messages</strong></td>
<td valign="top">[<a href="#message">Message</a>]</td>
<td>

Text content ongoing in the conversation

</td>
</tr>
</tbody>
</table>

### DailyMessageBreakdown

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>inBound</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>outBound</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>inBoundSMS</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>inBoundMediaMessages</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>outBoundSMS</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>outBoundMediaMessages</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### DailyVoiceBreakdown

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>inBound</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>outBound</strong></td>
<td valign="top">[<a href="#usagebreakdown">UsageBreakdown</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### Invite

A invite object containing all user specific invite messages

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>organization_id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td>

Organization identifier

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Content of the invite message

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>created_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updated_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
</tbody>
</table>

### Message

A message object containing all message contents

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>organization_id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td>

Organization identifier

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>created_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>phoneNumber</strong></td>
<td valign="top"><a href="#phonenumber">PhoneNumber</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>conversation</strong></td>
<td valign="top"><a href="#conversation">Conversation</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updated_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Message content

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>media</strong></td>
<td valign="top">[<a href="#string">String</a>]</td>
<td>

Media Messages urls

</td>
</tr>
</tbody>
</table>

### Mutation

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>dummy</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createConversation</strong></td>
<td valign="top"><a href="#conversation">Conversation</a>!</td>
<td>

Create a new conversation

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phoneNumbers</td>
<td valign="top">[<a href="#int">Int</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteConversation</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Delete the specific conversation

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createInvite</strong></td>
<td valign="top"><a href="#invite">Invite</a>!</td>
<td>

Create a new invite message

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">message</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateInvite</strong></td>
<td valign="top"><a href="#invite">Invite</a>!</td>
<td>

Update a specific invite

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">args</td>
<td valign="top"><a href="#updateableinvitefields">UpdateableInviteFields</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteInvite</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Delete the specific invite

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createMessage</strong></td>
<td valign="top"><a href="#message">Message</a>!</td>
<td>

Create a new message

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">phone_id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">message</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">media</td>
<td valign="top">[<a href="#string">String</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>batchCreatePhoneNumber</strong></td>
<td valign="top">[<a href="#phonenumber">PhoneNumber</a>]!</td>
<td>

Creates new phone number(s) with optional assignments

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#phonetype">PhoneType</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">amount</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">options</td>
<td valign="top"><a href="#phoneoptions">PhoneOptions</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatePhoneNumber</strong></td>
<td valign="top"><a href="#phonenumber">PhoneNumber</a>!</td>
<td>

Updates the specific phone number

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">args</td>
<td valign="top"><a href="#updateablephonenumberfields">UpdateablePhoneNumberFields</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deletePhoneNumber</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Deletes the specific phone number

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createUser</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

Creates a new system user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">physicalNumber</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createContact</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

Creates a new external user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">physicalNumber</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">ownerPhoneNumber</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUser</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

Updates a single user record

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">args</td>
<td valign="top"><a href="#updateableuserfields">UpdateableUserFields</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUsers</strong></td>
<td valign="top">[<a href="#user">User</a>]!</td>
<td>

Updates multiple users

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">args</td>
<td valign="top">[<a href="#updateableuserfields">UpdateableUserFields</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteUser</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
</tbody>
</table>

### PhoneNumber

A phone number object

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sid</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Twilio phone number SID

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>notified</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Track recycle notification

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>organization_id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td>

Organization identifier

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#phonetype">PhoneType</a>!</td>
<td>

Internal phone number identifier

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>systemNumber</strong></td>
<td valign="top"><a href="#phonestring">PhoneString</a>!</td>
<td>

Actual phone number value

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>conversations</strong></td>
<td valign="top">[<a href="#conversation">Conversation</a>]</td>
<td>

List of conversations involving the user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortoptions">SortOptions</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#datefilters">DateFilters</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>created_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>messages</strong></td>
<td valign="top">[<a href="#message">Message</a>]</td>
<td>

List of messages sent by the user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updated_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a></td>
<td>

User assigned to the phone number

</td>
</tr>
</tbody>
</table>

### Plan

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>base</strong></td>
<td valign="top"><a href="#baseplan">BasePlan</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cycleDate</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>numbers</strong></td>
<td valign="top"><a href="#report">Report</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sms</strong></td>
<td valign="top"><a href="#report">Report</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>mediaMessages</strong></td>
<td valign="top"><a href="#report">Report</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>minutes</strong></td>
<td valign="top"><a href="#report">Report</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>contacts</strong></td>
<td valign="top"><a href="#report">Report</a></td>
<td></td>
</tr>
</tbody>
</table>

### Report

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>used</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>included</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>overage</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
</tbody>
</table>

### TotalBreakdown

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>price</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>count</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
</tbody>
</table>

### TotalBreakdownByCategory

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>inBound</strong></td>
<td valign="top"><a href="#totalbreakdown">TotalBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>outBound</strong></td>
<td valign="top"><a href="#totalbreakdown">TotalBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>inBoundSMS</strong></td>
<td valign="top"><a href="#totalbreakdown">TotalBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>inBoundMediaMessages</strong></td>
<td valign="top"><a href="#totalbreakdown">TotalBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>outBoundSMS</strong></td>
<td valign="top"><a href="#totalbreakdown">TotalBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>outBoundMediaMessages</strong></td>
<td valign="top"><a href="#totalbreakdown">TotalBreakdown</a></td>
<td></td>
</tr>
</tbody>
</table>

### TotalBreakdownByVoice

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>inBound</strong></td>
<td valign="top"><a href="#totalbreakdown">TotalBreakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>outBound</strong></td>
<td valign="top"><a href="#totalbreakdown">TotalBreakdown</a></td>
<td></td>
</tr>
</tbody>
</table>

### TotalsBreakdown

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#totalbreakdownbycategory">TotalBreakdownByCategory</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>voice</strong></td>
<td valign="top"><a href="#totalbreakdownbyvoice">TotalBreakdownByVoice</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>phoneNumbers</strong></td>
<td valign="top"><a href="#totalbreakdown">TotalBreakdown</a></td>
<td></td>
</tr>
</tbody>
</table>

### Usage

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>usage</strong></td>
<td valign="top"><a href="#breakdown">Breakdown</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>usageByPhone</strong></td>
<td valign="top">[<a href="#breakdownbyphone">BreakdownByPhone</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>totals</strong></td>
<td valign="top"><a href="#totalsbreakdown">TotalsBreakdown</a></td>
<td></td>
</tr>
</tbody>
</table>

### UsageBreakdown

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>price</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>count</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>date</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
</tbody>
</table>

### User

A external user object

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>shouldContact</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Opt-in status of the user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>initialOptIn</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Initial opt-in status of the user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>physicalNumber</strong></td>
<td valign="top"><a href="#phonestring">PhoneString</a>!</td>
<td>

Users physical phone number

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>organization_id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td>

Organization identifier

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#usertype">UserType</a>!</td>
<td>

Type of User

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>created_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updated_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>opt_in</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td>

Date of opt-in

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>opt_out</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td>

Date of opt-out

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>directDialNumber</strong></td>
<td valign="top"><a href="#phonestring">PhoneString</a></td>
<td>

Optional direct dial number for voice calls

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Name of the user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>phoneNumbers</strong></td>
<td valign="top">[<a href="#phonenumber">PhoneNumber</a>]</td>
<td>

Assigned phone number

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invite</strong></td>
<td valign="top"><a href="#invite">Invite</a></td>
<td>

Organization level opt-in message

</td>
</tr>
</tbody>
</table>

## Enums

### AssignedType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNASSIGNED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ASSIGNED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### PhoneType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>CONTACT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>POOL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USER</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SortOptions

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ASC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DESC</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UserType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>CONTACT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USER</strong></td>
<td></td>
</tr>
</tbody>
</table>

## Scalars

### Boolean

The `Boolean` scalar type represents `true` or `false`.

### Date

Scalar `Date` to represent datetime values

### Float

The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](http://en.wikipedia.org/wiki/IEEE_floating_point). 

### ID

The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.

### Int

The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. 

### PhoneString

Scalar `PhoneString` to represent formatted string data

### String

The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.


## Interfaces


### Node

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>organization_id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td>

Organization identifier

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>created_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updated_at</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
</tbody>
</table>
