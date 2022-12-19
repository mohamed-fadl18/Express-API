const fs = require("fs");
const uuid = require("uuid");
// express with https connection
/* const app = require('https-localhost')()
const port = process.env.PORT || 3000; */
// express with http or local connection
const app = require("express")();
const port = process.env.PORT || 8080;
var cors = require("cors");
var projID = uuid.v4();
var shID;
var goalID = uuid.v4();
// sql connection and configurations (update to match your configurations)
const sql = require("mssql");
var SQLconfig = {
  user: "sa",
  password: "123456",
  server: "localhost",
  requestTimeout: 300000,
  options: {
    encrypt: false,
  },
};
// home
app.get("/", (req, res) => {
  res.send("<h1>Diamond API</h1>");
});
//cors
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// SQL query

// ESC

//get domains
app.get("/domains", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`SELECT * FROM [ESC].[dbo].[Domains] order by dmn_name`;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get all values
app.get("/lov", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT lvl_value, dmn_name, lvl_activeFlag
    FROM [ESC].[dbo].[LOValues]
    inner join [ESC].[dbo].[Domains]
    on dmn_RECID=lvl_dom_RECID
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get domain's values
app.get("/values/:dmnID", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`SELECT * FROM [ESC].[dbo].[LOValues] where lvl_dom_RECID = ${req.params.dmnID} order by lvl_orderID`;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

//update domain's values
app.get("/setValues", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    if exists(SELECT * from ESC.dbo.LOValues where lvl_RECID=${req.query.valueID})
    begin            
      UPDATE ESC.dbo.LOValues
      SET 
        lvl_orderID = ${req.query.order}, 
        lvl_value = ${req.query.value},
        lvl_valueMax = ${req.query.max}, 
        lvl_description = ${req.query.desc}, 
        lvl_activeFlag = ${req.query.active},
        lvl_dateChanged = ${req.query.date}, 
        lvl_changedBy = ${req.query.user}
      WHERE lvl_RECID=${req.query.valueID}
    End
    else            
    begin 
      INSERT INTO ESC.dbo.LOValues
      (
        lvl_RECID,
        lvl_dom_RECID, 
        lvl_orderID, 
        lvl_value, 
        lvl_valueMax, 
        lvl_description, 
        lvl_activeFlag, 
        lvl_inactiveDate, 
        lvl_dateChanged, 
        lvl_changedBy, 
        lvl_dateCreated, 
        lvl_createdBy
      )
      VALUES
      (
        ${req.query.valueID},
        ${req.query.domID},
        ${req.query.order},
        ${req.query.value},
        ${req.query.max},
        ${req.query.desc},
        ${req.query.active},
        NULL,
        NULL,
        NULL,
        ${req.query.date},
        ${req.query.user}
      )
    end
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});
//get user data
app.get("/user", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`select * from ESC.dbo.users where usr_user_ID=${req.query.id}`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});
// create user
app.get("/createUser", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into ESC.dbo.Users
    (usr_RECID,usr_user_ID,usr_preferred_page,usr_dateActivated,usr_dateRevoked,usr_full_name,usr_dateChanged,usr_changedBy,usr_accessLevel,usr_email)
    values
    (
      ${req.query.uid},
      ${req.query.userID},
      NULL,
      ${req.query.date},
      NULL,
      ${req.query.name},
      ${req.query.date},
      ${req.query.currentUser},
      1,
      ${req.query.email}
      )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});
//get user data
app.get("/admin", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    -- users
    select COUNT(usr_full_name) as activeUsers from (select * from ESC.dbo.users where usr_dateRevoked is null) as activeUsers
    select COUNT(usr_full_name) as inactiveUsers  from (select * from ESC.dbo.users where usr_dateRevoked is not null) as inactiveUsers 

    -- librabry items
    select COUNT(LIV_verGUID) as publishedLI from (select * from LibraryCatalog.dbo.LibraryItemVersions 
    inner join LibraryCatalog.dbo.LibraryItems on LIV_liGUID=LI_liGUID where LI_status = 'published') as publishedLI
    select COUNT(LIV_verGUID) as draftLI from (select * from LibraryCatalog.dbo.LibraryItemVersions
    inner join LibraryCatalog.dbo.LibraryItems on LIV_liGUID=LI_liGUID where LI_status = 'draft') as draftLI
    select COUNT(LIV_verGUID) as LI from (select * from LibraryCatalog.dbo.LibraryItemVersions
    inner join LibraryCatalog.dbo.LibraryItems on LIV_liGUID=LI_liGUID) as LI

    -- methodologies
    select COUNT(CMP_GUID) as methodologies from (select * from Methodology.dbo.Compliances) as methodologies
    select COUNT(CMP_GUID) as publishedMethodologies from (select * from Methodology.dbo.Compliances where CMP_status = 'published') as publishedMethodologies
    select COUNT(CMP_GUID) as draftMethodologies from (select * from Methodology.dbo.Compliances where CMP_status = 'draft') as draftMethodologies

    -- plans
    select COUNT(PPV_versionGUIID) as plans from (select * from ProjectSpace.dbo.ProjectPlanVersions) as plans
    select COUNT(PPV_versionGUIID) as publishedPlans from (select * from ProjectSpace.dbo.ProjectPlanVersions where PPV_status = 'published') as publishedPlans
    select COUNT(PPV_versionGUIID) as draftPlans from (select * from ProjectSpace.dbo.ProjectPlanVersions where PPV_status = 'draft') as draftPlans

    -- projects
    select COUNT(CPJ_projGUID) as projects from (select * from ProjectSpace.dbo.CandidateProjects) as projects
    select COUNT(CPJ_projGUID) as publishedprojects from (select * from ProjectSpace.dbo.CandidateProjects where CPJ_status = 'published') as publishedProjects
    select COUNT(CPJ_projGUID) as draftprojects from (select * from ProjectSpace.dbo.CandidateProjects where CPJ_status = 'draft') as draftProjects

    -- clients
    select COUNT(CPJ_client_name) as clients from (select distinct CPJ_client_name from ProjectSpace.dbo.CandidateProjects) as clients
    `;
    })
    .then((result) => {
      var sets = [];
      for (let set of result.recordsets) {
        sets.push(set[0]);
      }
      res.send(sets);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get unassigned roles
app.get("/roles", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select rol_RECID, rol_role
    from ESC.dbo.roles 
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});
// get user roles
app.get("/userRoles", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select rol_RECID, rol_role, rol_description, usr_RECID, usr_user_ID, usr_full_name, usr_email
    from esc.dbo.roles 
    inner join ESC.dbo.UsersRoles on rol_RECID=uro_role_RECID 
    inner join ESC.dbo.Users on usr_RECID=uro_usr_RECID where usr_user_ID=${req.query.id}`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});
// assgin role
app.get("/assignRole", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    if exists(SELECT * from ESC.dbo.UsersRoles where 
      uro_usr_RECID=(select usr_RECID from ESC.dbo.Users where usr_user_ID=${req.query.userID}) 
      and uro_role_RECID=(select rol_RECID from ESC.dbo.Roles where rol_role=${req.query.roleName}))
    begin            
      select usr_RECID from ESC.dbo.Users where usr_user_ID=${req.query.userID}
    End
    else            
    begin 
      INSERT INTO ESC.dbo.UsersRoles(uro_usr_RECID, uro_role_RECID)
      VALUES ((select usr_RECID from ESC.dbo.Users where usr_user_ID=${req.query.userID}),
      (select rol_RECID from ESC.dbo.Roles where rol_role=${req.query.roleName}))
    end
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});
//delete role
app.get("/deleteRole", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    delete from ESC.dbo.UsersRoles 
    where uro_usr_RECID=
    (select usr_RECID from ESC.dbo.Users where usr_user_ID=${req.query.userID}) 
    AND uro_role_RECID=
    (select rol_RECID from ESC.dbo.Roles where rol_role=${req.query.roleName})
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//Candidate projects

//get projects of clients
app.get("/clientsProjects", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select distinct top 10 CPJ_client_name as name, count(CPJ_client_name) as value
    from ProjectSpace.dbo.CandidateProjects
    where CPJ_deleted is null
    group by CPJ_client_name
    order by value desc

    select CPJ_name from ProjectSpace.dbo.CandidateProjects
    where CPJ_status = 'published'

    select CPJ_name from ProjectSpace.dbo.CandidateProjects
    where CPJ_status = 'draft'
    `;
    })
    .then((result) => {
      var data = {
        clients: result.recordsets[0],
        published: result.recordsets[1],
        draft: result.recordsets[2],
      };
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});
//get plans of projects
app.get("/projectsPlans", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT distinct TOP 10 [CPJ_name] as name, COUNT([CPJ_name]) as value
    FROM [ProjectSpace].[dbo].[CandidateProjects]
    inner join [ProjectSpace].[dbo].ProjectPlanVersions
    on CPJ_projGUID=PPV_projGUID
    group by [CPJ_name]
    order by value desc

    select PPV_name from ProjectSpace.dbo.ProjectPlanVersions
    where PPV_status = 'published'

    select PPV_name from ProjectSpace.dbo.ProjectPlanVersions
    where PPV_status = 'draft'
    `;
    })
    .then((result) => {
      var data = {
        projects: result.recordsets[0],
        published: result.recordsets[1],
        draft: result.recordsets[2],
      };
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get projects
app.get("/projects", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select * from ProjectSpace.dbo.CandidateProjects
    left join ESC.dbo.Users
    on CPJ_created_by = usr_user_ID
    where CPJ_deleted is null
    order by CPJ_name`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get clinet's projects
app.get("/clientProjects", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select * from ProjectSpace.dbo.CandidateProjects
    where CPJ_deleted is null and CPJ_client_name=${req.query.client}
    order by CPJ_name`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get projects with plans
app.get("/projectsWithPlans", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select * from ProjectSpace.dbo.CandidateProjects
    inner join ProjectSpace.dbo.ProjectPlanVersions
    on CPJ_projGUID=PPV_projGUID
    left join ESC.dbo.Users
    on PPV_created_by = usr_user_ID
    where CPJ_deleted is null and ppv_deleted is null
    order by ppv_name`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get single project
app.get("/project", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select * from ProjectSpace.dbo.CandidateProjects
    left join ESC.dbo.Users
    on CPJ_created_by = usr_user_ID
    where CPJ_projGUID=${req.query.projID}`;
    })
    .then((result) => {
      res.send(result.recordsets[0][0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get single project with plan
app.get("/projectWithPlan", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select 
    CPJ_changed_by,
    CPJ_changed_date,
    CPJ_clientPSAid,
    CPJ_clientPSAname,
    CPJ_client_description,
    CPJ_client_name,
    CPJ_created_by,
    CPJ_created_date,
    CPJ_description,
    CPJ_name,
    CPJ_owner,
    CPJ_projGUID,
    CPJ_projType,
    CPJ_status,
    CPJ_status_date,
    PPV_changed_by,
    PPV_changed_date,
    PPV_created_by,
    PPV_created_date,
    PPV_description,
    PPV_exportDate,
    PPV_name,
    PPV_owner,
    PPV_projGUID,
    PPV_status,
    PPV_status_date,
    PPV_version,
    PPV_versionDate,
    PPV_versionGUIID,
    usr_full_name
    from ProjectSpace.dbo.CandidateProjects
    inner join ProjectSpace.dbo.ProjectPlanVersions
    on CPJ_projGUID=PPV_projGUID
    left join ESC.dbo.Users
    on PPV_created_by = usr_user_ID
    where CPJ_projGUID=${req.query.projID} AND PPV_versionGUIID=${req.query.vID}`;
    })
    .then((result) => {
      res.send(result.recordset[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get single project tasks
app.get("/projectTasks", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select
    PRT_taskGUID,
    PRT_name,
    PRT_description,
    PRT_work,
    PRT_WBS,
    PRT_summary,
    PTD_output,
    PTD_input,
    PTD_how_to,
    PTD_purpose,
    WTS_milestoneFL,
    PRT_distributionWork,
    PPV_created_date,
    PRT_duration,
    PRT_parentGUID,
    PRT_orderID,
    (select top 1 PMW_pcompGUID from ProjectSpace.dbo.ProjectComponents where PMW_versionGUIID=${req.query.projID}) as PMW_pcompGUID
    
    from ProjectSpace.dbo.CandidateProjects

    inner join ProjectSpace.dbo.ProjectPlanVersions
    on CPJ_projGUID=PPV_projGUID

    inner join ProjectSpace.dbo.ProjectTasks
    on PPV_versionGUIID=PRT_versionGUIID

    inner join ProjectSpace.dbo.ProjectTaskDetails
    on PRT_taskGUID=PTD_taskGUID

    where PRT_versionGUIID=${req.query.projID}
    order by PRT_orderID, PRT_WBS
    `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get single project tasks gantt
app.get("/gantt", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select
	  [PRT_taskGUID],
    [PRT_parentGUID],
    [PRT_duration],
    [PPV_created_date],
    PRT_name,
    PRT_WBS,
    PTD_output,
    PRT_distributionWork

    from ProjectSpace.dbo.CandidateProjects

    inner join ProjectSpace.dbo.ProjectPlanVersions
    on CPJ_projGUID=PPV_projGUID

    inner join ProjectSpace.dbo.ProjectTasks
    on PPV_versionGUIID=PRT_versionGUIID

    inner join ProjectSpace.dbo.ProjectTaskDetails
    on PRT_taskGUID=PTD_taskGUID

    where PRT_versionGUIID= '5ACA6D67-8A9E-409C-A17E-0037C7269F01'
    order by PRT_orderID, PRT_WBS
    `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get single project tasks gantt (test)
app.get("/taskComp", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT top 1 * FROM [ProjectSpace].[dbo].[ProjectComponents]

    inner join [ProjectSpace].[dbo].[ProjectComponentTasks]
    on PMW_pcompGUID=PCT_pcompGUID

    inner join [Methodology].[dbo].[WorkProductComponents]
    on [WPC_wpcGUID]=PMW_wpcGUID

    left join [Methodology].[dbo].[WPC_Task_Relations]
    on [WPC_wpcGUID]=[WTR_wpcGUID]

    left join [Methodology].[dbo].[WPC_Tasks]
    on [WTR_WPCtaskGUID]=[WTS_WPCtaskGUID]

    left join [Methodology].[dbo].[WPC_TaskOutcomes]
    on [WTR_WPCtaskGUID]=[WTO_wpcTaskGUID]

    left join [Methodology].[dbo].[WPC_TaskDescriptions]
    on [WTH_WPCtaskGUID]=[WTS_WPCtaskGUID]

    left join [Methodology].[dbo].[WPC_Assignation]
    on [WAR_taskGUID]=[WTS_WPCtaskGUID]

    left join [Methodology].[dbo].[WPC_References]
    on [WLI_referencingTask]=[WTS_WPCtaskGUID]
    where [WTS_name]=${req.query.tName}
    `;
    })
    .then((result) => {
      res.send(result.recordset[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get task Resources
app.get("/taskResources", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select DISTINCT
      ASN_GUID,
      ASN_distribution ,
      ASN_leadFL ,
      ASN_groupInd ,
      ASN_resourceName,
      SRT_description
      

    from ProjectSpace.dbo.ProjectTaskAssignments 

    INNER JOIN ProjectSpace.DBO.SymbolicResources
    ON SRT_name=ASN_resourceName

    inner join [ProjectSpace].[dbo].[EstimateHourlyRates]
	  on EHR_resourceName=ASN_resourceName

    where ASN_taskGUID=${req.query.taskID}
    order by ASN_distribution desc
    `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send([err]);
    });
});

//get task refs
app.get("/taskRefs", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select
    PTR_refType,
    PTR_fileName
    from ProjectSpace.dbo.ProjectTaskReferences
    where PTR_taskGUID = ${req.query.taskID}
    `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send([err]);
    });
});

//get project goals
app.get("/goal", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`select * from ProjectSpace.dbo.Goals where GLS_projGUID=${req.query.projID}`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get goal objectives
app.get("/objectives", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`select * from ProjectSpace.dbo.Objectives where OBJ_goalGUID=${req.query.goalID}`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get project ScopeRecords
app.get("/scope", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`select * from ProjectSpace.dbo.ScopeRecords where SCR_projGUID=${req.query.projID}`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get project stakeholders
app.get("/stakeholders", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`select * from ProjectSpace.dbo.StakeHolders where STH_projGUID=${req.query.projID} order by STH_orderID`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//Create candidate project

//insert project details
app.get("/createProject", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      projID = uuid.v4();
      return sql.query`INSERT INTO ProjectSpace.dbo.CandidateProjects
      (CPJ_projGUID, CPJ_name, CPJ_description, CPJ_owner, 
      CPJ_status, CPJ_status_date, CPJ_client_name, CPJ_created_by, 
      CPJ_created_date, CPJ_projType) 
      VALUES 
      (${projID},${req.query.projName},${req.query.projDescription},${req.query.projOwner},
      ${req.query.projStatus},${req.query.projSD},${req.query.projCN},${req.query.createdBy},
      ${req.query.projDate},${req.query.projType})`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert project stake holders
app.get("/insertSH", (req, res) => {
  shID = uuid.v4();
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      ALTER TABLE ProjectSpace.dbo.StakeHolders NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.StakeHolders
      (STH_RECID, STH_role, STH_orderID, STH_description, STH_projGUID) 
      VALUES 
      (${shID},${req.query.shRole},${req.query.shOID},${req.query.shDescription},
      ${projID})`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert project plan version
app.get("/insertVR", async (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      INSERT INTO ProjectSpace.dbo.ProjectPlanVersions 
      (PPV_versionGUIID,PPV_projGUID,PPV_name,PPV_version,
      PPV_versionDate,PPV_owner,PPV_status,PPV_status_date,PPV_description,PPV_exportDate,
      PPV_created_by,PPV_created_date,PPV_changed_by,PPV_changed_date,PPV_deleted)
      VALUES 
      (${req.query.vID},${req.query.projID},${req.query.name},${req.query.version},${req.query.date},
      ${req.query.owner},${req.query.status},${req.query.date},${req.query.desc},NULL,
      ${req.query.createdBy},${req.query.date},NULL,NULL,NULL)`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert project scope recoreds
app.get("/insertSR", (req, res) => {
  srID = uuid.v4();
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      ALTER TABLE ProjectSpace.dbo.ScopeRecords NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.ScopeRecords
      (SCR_scopeGUID, SCR_type, SCR_orderID, SCR_acceptance, SCR_scopeStatement, SCR_description,
      SCR_name, SCR_reason, SCR_categoryConst, SCR_reqType, SCR_delType, SCR_neededBy, SCR_created_by,
      SCR_created_date, SCR_activeFlag, SCR_projGUID, SCR_ver_GUID, SCR_parentGUID) 
      VALUES 
      (${req.query.srID},${req.query.srType},${req.query.srOID},${req.query.srAcceptance},
      ${req.query.srScopeStatement},${req.query.srDescription},${req.query.srName},${req.query.srReason},
      ${req.query.srCategory},${req.query.srReqType},${req.query.srDelType},${req.query.srNeededBy},
      ${req.query.srCreatedBy},${req.query.srCreatedDate},${req.query.srAF},${projID},
      NULL,NULL)`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert project goals
app.get("/insertGoal", (req, res) => {
  goalID = uuid.v4();
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      ALTER TABLE ProjectSpace.dbo.Goals NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.Goals
      (GLS_goalGUID, GLS_name, GLS_orderID, GLS_description, GLS_goalType, GLS_projGUID, GLS_objective) 
      VALUES 
      (${goalID},${req.query.goalName},${req.query.goalOID},${req.query.goalDescription},
      ${req.query.goalType},${projID},${req.query.goalObjectives})`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert project gaol's objectives
app.get("/insertOBJ", (req, res) => {
  var objID = uuid.v4();

  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      ALTER TABLE ProjectSpace.dbo.Objectives NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.Objectives
      (OBJ_GUID, OBJ_name, OBJ_orderID, OBJ_description, OBJ_target, OBJ_neededBy, OBJ_goalGUID) 
      VALUES 
      (${objID},${req.query.objName},${req.query.objOID},${req.query.objDescription},
      ${req.query.objTarget},${req.query.objNeededBy},${goalID})`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// edit project deatails
app.get("/editProject", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      UPDATE ProjectSpace.dbo.CandidateProjects
      SET 
      CPJ_name=${req.query.projName},
      CPJ_description=${req.query.projDescription},
      CPJ_status=${req.query.projStatus},
      CPJ_client_name=${req.query.projCN},
      CPJ_changed_by=${req.query.changedBy},
      CPJ_changed_date=${req.query.projChangedDate}

      WHERE CPJ_projGUID=${req.query.projID}
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// edit project plan
app.get("/editPlan", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      UPDATE ProjectSpace.dbo.ProjectPlanVersions
      SET 
      PPV_name=${req.query.name},PPV_status=${req.query.status},PPV_description=${req.query.desc}
      ,PPV_changed_by=${req.query.changedBy},PPV_changed_date=${req.query.changedDate}
      WHERE PPV_versionGUIID=${req.query.vid}
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// edit project plan tasks
app.get("/editTasks", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      if (req.query.parent === "0") {
        req.query.parent = null;
      }
      return sql.query`
      UPDATE ProjectSpace.dbo.ProjectTasks
      SET 
      PRT_WBS=${req.query.wbs},PRT_parentGUID=${req.query.parent},PRT_orderID=${req.query.order}
      WHERE PRT_taskGUID=${req.query.tid} and PRT_versionGUIID=${req.query.vid}
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// delete project plan tasks
app.get("/deleteTasks", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      if (req.query.parent === "0") {
        req.query.parent = null;
      }
      return sql.query`
      DELETE
      FROM ProjectSpace.dbo.ProjectTasks
      WHERE PRT_taskGUID=${req.query.tid}

      DELETE
      FROM ProjectSpace.dbo.ProjectTaskAssignments
      WHERE ASN_taskGUID=${req.query.tid}

      DELETE
      FROM ProjectSpace.dbo.ProjectTaskDependencies
      WHERE DEP_taskGUID=${req.query.tid}

      UPDATE ProjectSpace.dbo.ProjectTaskReferences
      SET PTR_taskGUID=NULL
      WHERE PTR_taskGUID=${req.query.tid}

      DELETE
      FROM ProjectSpace.dbo.TaskWorkProducts
      WHERE TWP_taskGUID=${req.query.tid}
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// delete project plan
app.get("/deletePlan", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      update ProjectSpace.dbo.ProjectPlanVersions
      set PPV_deleted = 1
      where PPV_versionGUIID = ${req.query.vid}
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// edit Stake Holders
app.get("/editSH", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`UPDATE ProjectSpace.dbo.StakeHolders
      SET 
      STH_role=${req.query.shRole},
      STH_description=${req.query.shDescription}

      WHERE STH_RECID=${req.query.shID}`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// edit Scope Records
app.get("/editSR", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`UPDATE ProjectSpace.dbo.ScopeRecords
      SET 
      SCR_type=${req.query.srType},
      SCR_acceptance=${req.query.srAcceptance},
      SCR_scopeStatement=${req.query.srScopeStatement},
      SCR_description=${req.query.srDescription},
      SCR_name=${req.query.srName},
      SCR_reason=${req.query.srReason},
      SCR_categoryConst=${req.query.srCategory},
      SCR_reqType=${req.query.srReqType},
      SCR_delType=${req.query.srDelType},
      SCR_changed_by=${req.query.srChangedBy},
      SCR_changed_date=${req.query.srChangedDate}

      WHERE SCR_scopeGUID=${req.query.srID}`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// edit goals
app.get("/editGoal", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      projID = req.query.projID;
      return sql.query`UPDATE ProjectSpace.dbo.Goals
      SET 
      GLS_name=${req.query.goalName},
      GLS_goalType=${req.query.goalType},
      GLS_objective=${req.query.goalObjectives}

      WHERE GLS_goalGUID=${req.query.goalID}`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// edit Objectives
app.get("/editOBJ", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      projID = req.query.projID;
      return sql.query`UPDATE ProjectSpace.dbo.Objectives
      SET 
      OBJ_name=${req.query.objName},OBJ_orderID=${req.query.objOID},
      OBJ_description=${req.query.objDescription},OBJ_target=${req.query.objTarget},
      OBJ_neededBy=${req.query.objNeededBy}

      WHERE OBJ_goalGUID=${req.query.goalID} AND OBJ_GUID=${req.query.objID}`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send([err]);
    });
});

// delete project plan tasks
app.get("/deleteTasks", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      if (req.query.parent === "0") {
        req.query.parent = null;
      }
      return sql.query`
      DELETE
      FROM ProjectSpace.dbo.ProjectTasks
      WHERE PRT_taskGUID=${req.query.tid}

      DELETE
      FROM ProjectSpace.dbo.ProjectTaskAssignments
      WHERE ASN_taskGUID=${req.query.tid}

      DELETE
      FROM ProjectSpace.dbo.ProjectTaskDependencies
      WHERE DEP_taskGUID=${req.query.tid}

      UPDATE ProjectSpace.dbo.ProjectTaskReferences
      SET PTR_taskGUID=NULL
      WHERE PTR_taskGUID=${req.query.tid}

      DELETE
      FROM ProjectSpace.dbo.TaskWorkProducts
      WHERE TWP_taskGUID=${req.query.tid}
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// delete project plan
app.get("/deletePlan", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      update ProjectSpace.dbo.ProjectPlanVersions
      set PPV_deleted = 1
      where PPV_versionGUIID = ${req.query.vid}
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// Library Catalog queries

// library item per years (2019,2020,2021)
app.get("/liYears", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT 
    [LIV_createdDate] as time
      
    FROM [LibraryCatalog].[dbo].[LibraryItemVersions]
    order by [LIV_createdDate]
    `;
    })
    .then((result) => {
      return result.recordset;
    })
    .then((data) => {
      // this gives an object with dates as keys
      var data = data;
      let finalObj = {};
      data.forEach((lis) => {
        var date = lis.time.toString().split("GMT")[0];
        if (
          date.includes("2019") ||
          date.includes("2020") ||
          date.includes("2021")
        ) {
          var month = new Date(lis.time).getMonth() + 1;
          var year = new Date(lis.time).getFullYear();
          if (finalObj[month + " " + year]) {
            finalObj[month + " " + year].push(lis);
          } else {
            finalObj[month + " " + year] = [lis];
          }
        }
      });
      res.send(finalObj);
    })
    .catch((err) => {
      res.send(err);
    });
});

// library item types
app.get("/liTypes", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT distinct top 10
    LIV_contentType as name,
    COUNT(LIV_contentType) as value

    FROM [LibraryCatalog].[dbo].[LibraryItemVersions]
    group by LIV_contentType
    `;
    })
    .then((data) => {
      res.send(data.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get class refrences
app.get("/classRefs", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`SELECT * FROM LibraryCatalog.dbo.ClassRefs`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get type refrences
app.get("/typeRefs", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`select distinct TRF_name from LibraryCatalog.dbo.TypeRefs where TRF_className=${req.query.className}`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

// insert rating
app.get("/rating", (req, res) => {
  var rateID = uuid.v4();
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`insert into LibraryCatalog.dbo.RatingByReaders
    (RBR_rtGUID, RBR_verGUID, RBR_userID, RBR_comments, RBR_rating, RBR_createdDate) 
    values (${rateID},${req.query.vID},${req.query.userID},${req.query.comment},${req.query.rating},
    ${req.query.date})`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get genre refrences
app.get("/genreRefs", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`select distinct GRF_name from LibraryCatalog.dbo.GenreRefs where GRF_typeName=${req.query.typeName}`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get user favorites
app.get("/favLI", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`SELECT LI_liGUID, LI_title, LI_descripton, LI_type, LI_status, LI_KMStatus, 
      LI_userRating, LI_created_date, TXN_className, TXN_typeName, TXN_genreName,
      LIV_verGUID,LIV_fileLocation
      FROM LibraryCatalog.dbo.LibraryItems
      inner join LibraryCatalog.dbo.Taxonomies
      on LI_liGUID=TXN_liGUID
      inner join LibraryCatalog.dbo.LibraryItemVersions
      on LI_liGUID=LIV_liGUID
      inner join LibraryCatalog.dbo.Favorites
      on LibraryItemId=[LI_liGUID]
      where UserId = (select usr_RECID from ESC.dbo.Users where usr_full_name = ${req.query.userID})
      order by LI_title`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send([err]);
    });
});

// add to user favorites
app.get("/addFavLI", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      IF EXISTS 
      (SELECT 1 FROM LibraryCatalog.dbo.Favorites WHERE LibraryItemId = ${req.query.liID} and UserId = ${req.query.userID})
      begin
        update LibraryCatalog.dbo.Favorites
        set LibraryItemId = ${req.query.liID} ,UserId = ${req.query.userID}
        WHERE LibraryItemId = ${req.query.liID} and UserId = ${req.query.userID}
      end
      else
      begin
        insert into LibraryCatalog.dbo.Favorites(LibraryItemId, UserId, FavoriteDate) 
        values (${req.query.liID},${req.query.userID},${req.query.favDate})
      end
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// delete from user favorites
app.get("/delFavLI", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`delete from LibraryCatalog.dbo.Favorites 
      where LibraryItemId=${req.query.liID} and UserId=${req.query.userID}`;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send([err]);
    });
});

// get libraby Items
app.get("/LIs", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT LI_liGUID, LI_title, LI_descripton, LI_type, LI_status, LI_KMStatus, 
    LI_userRating, LI_created_date, TXN_className, TXN_typeName, TXN_genreName,
    LIV_verGUID, LIV_fileLocation, LI_created_by, LIV_created_by
    FROM LibraryCatalog.dbo.LibraryItems
    inner join LibraryCatalog.dbo.Taxonomies
    on LI_liGUID=TXN_liGUID
    inner join LibraryCatalog.dbo.LibraryItemVersions
    on LI_liGUID=LIV_liGUID
    order by LI_title
    `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send([err]);
    });
});

// get filtered libraby Items
app.get("/LIsFilterd", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT LI_liGUID, LI_title, LI_descripton, LI_type, LI_status, LI_KMStatus, 
    LI_userRating, LI_created_date, TXN_className, TXN_typeName, TXN_genreName,
    LIV_verGUID,LIV_fileLocation
    FROM LibraryCatalog.dbo.LibraryItems

    inner join LibraryCatalog.dbo.Taxonomies
    on LI_liGUID=TXN_liGUID

    inner join LibraryCatalog.dbo.Favorites
    on LibraryItemId=LI_liGUID

    inner join LibraryCatalog.dbo.LibraryItemVersions
    on LI_liGUID=LIV_liGUID

    left join [Methodology].[dbo].[WPC_References]
    on LI_liGUID=WLI_liGUID

    left join [Methodology].[dbo].[WPC_Compliances]
    on [WCM_wpcGUID]=WLI_usedInWPCGUID
    
    left join [Methodology].[dbo].Compliances
    on [WCM_compGUID]=CMP_GUID

    where TXN_className =${req.query.filter} or TXN_typeName =${req.query.filter} 
    or TXN_genreName =${req.query.filter} or CMP_name =${req.query.filter}
    order by LI_title
    `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send([err]);
    });
});

// get single libraby Item
app.get("/LI", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT * FROM LibraryCatalog.dbo.LibraryItems
    inner join LibraryCatalog.dbo.Taxonomies
    on LI_liGUID=TXN_liGUID
    inner join LibraryCatalog.dbo.LibraryItemVersions
    on LI_liGUID=LIV_liGUID
    where LI_liGUID=${req.query.liID}
    `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send([err]);
    });
});

// get single libraby Item ratings
app.get("/LIrate", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT *
    FROM [LibraryCatalog].[dbo].[RatingByReaders]
    inner join [LibraryCatalog].[dbo].LibraryItemVersions
    on [RBR_verGUID]=[LIV_verGUID]
    where LIV_verGUID=${req.query.liID}
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send([err]);
    });
});

// get single libraby Item WPC
app.get("/LiWPC", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT *
    FROM [Methodology].[dbo].WorkProductComponents
    inner join [Methodology].[dbo].WPC_References
    on WPC_wpcGUID=WLI_usedInWPCGUID
    left join ESC.dbo.Users
    on WPC_created_by = usr_user_ID
    where WLI_liGUID=${req.query.liID}
    `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send([err]);
    });
});

// get single libraby Item ProjectPlan
app.get("/LiProject", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT distinct PPV_name, PPV_status, PPV_version, PPV_created_by, PPV_deleted, usr_full_name
    FROM [ProjectSpace].[dbo].[ProjectPlanVersions]
    inner join [ProjectSpace].[dbo].ProjectTaskReferences
    on PPV_projGUID=PTR_projGUID
    left join ESC.dbo.Users
	  on PPV_created_by = usr_user_ID
    where PTR_liGUID=${req.query.liID}
    `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send([err]);
    });
});

// create libraby Item

//insert libraby item details
app.get("/createLi", (req, res) => {
  liID = req.query.liID;
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`INSERT INTO LibraryCatalog.dbo.LibraryItems
      (LI_liGUID, LI_authorName, LI_title, LI_descripton, LI_accessLevel, LI_type, 
      LI_status, LI_statusDate, LI_KMStatus, LI_created_by, LI_created_date, LI_Knowledge_Area, 
      LI_clientReady, LI_KMStatusDate) 
      VALUES 
      (${req.query.liID},${req.query.authorName},${req.query.liTitle},${req.query.liDescription},
      ${req.query.accessLevel},${req.query.liType},${req.query.liStatus},${req.query.liStatusDate},
      ${req.query.liKMS},${req.query.liCreatedBy},${req.query.liCreatedDate},
      ${req.query.knowledgeArea},${req.query.clientReady},${req.query.liKMSDate})`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert libraby item Taxonomies
app.get("/createLiTx", (req, res) => {
  var txID = uuid.v4();
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      ALTER TABLE LibraryCatalog.dbo.Taxonomies NOCHECK CONSTRAINT ALL
      INSERT INTO LibraryCatalog.dbo.Taxonomies
      (TXN_txGUID, TXN_liGUID, TXN_className, TXN_typeName, TXN_genreName, 
      TXN_status, TXN_typeEnumeration) 
      VALUES 
      (${txID},${req.query.liID},${req.query.className},${req.query.typeName},${req.query.genreName},
      ${req.query.txStatus},1)`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert libraby item versions
app.get("/createLiV", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      ALTER TABLE LibraryCatalog.dbo.LibraryItemVersions NOCHECK CONSTRAINT ALL
      INSERT INTO LibraryCatalog.dbo.LibraryItemVersions
      (LIV_verGUID, LIV_liGUID, LIV_version, LIV_versionDate,LIV_createdDate,
      LIV_filedBy, LIV_URL, LIV_fileLocation, LIV_content, LIV_contentType,LIV_created_by) 
      VALUES 
      (${req.query.livID},${req.query.liID},'1',${req.query.vDate},${req.query.createdDate},${req.query.filedBy},
      ${req.query.URL},${req.query.fileLocation},NULL,${req.query.contentType},
      ${req.query.createdBy})`;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// edit li deatails
app.get("/editLI", (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (req.query[key] === "null") {
      req.query[key] = null;
    }
  });
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`UPDATE LibraryCatalog.dbo.LibraryItems
      SET 
      LI_authorName=${req.query.author},
      LI_title=${req.query.title},
      LI_descripton=${req.query.desc},
      LI_status=${req.query.status},
      LI_Knowledge_Area=${req.query.ka},
      LI_KMStatus=${req.query.km},
      LI_clientReady=${req.query.ready},
      LI_accessLevel=${req.query.access}
      
      WHERE LI_liGUID=${req.query.liID}

      UPDATE LibraryCatalog.dbo.Taxonomies
      SET 
      TXN_className=${req.query.class},
      TXN_typeName=${req.query.type},
      TXN_genreName=${req.query.genre}

      WHERE TXN_liGUID=${req.query.liID}
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//Methodology

// most used methodologies
app.get("/methMost", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select distinct top 10 PMW_name as name, COUNT(*) as value from ProjectSpace.dbo.ProjectComponents
    inner join ProjectSpace.dbo.ProjectPlanVersions
    on PPV_versionGUIID = PMW_versionGUIID
    inner join Methodology.dbo.Compliances
    on PMW_methGUID = CMP_GUID
    where PMW_nameType = 'm'
    group by  PMW_name
    order by value desc

    select CMP_GUID from Methodology.dbo.Compliances
    where CMP_status = 'published'
    
    select CMP_GUID from Methodology.dbo.Compliances
    where CMP_status = 'draft'
    `;
    })
    .then((data) => {
      var meths = {
        meths: data.recordsets[0],
        published: data.recordsets[1],
        draft: data.recordsets[2],
      };
      res.send(meths);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get meths
app.get("/cmp", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      SELECT 
      WPC_name,
      CMP_name,
      CMP_status,
      WTO_name,
      WPC_created_date,
      WCM_wpcGUID,
      CMP_created_date,
      WCM_compGUID,
      WTS_orderID,
      WTS_outlineLevel,
      WTS_work,
      WTS_summaryFL,
      WTS_distributionWork,
      WLI_liGUID,
      MTD_hzcName,
      MTD_vtcName,
      WTS_description,
      WTS_criticalFL,
      WTS_taskType,
      WTS_timeboxFL,
      WTH_purpose,
      WTH_input,
      WTH_output,
      WTH_how_to,
      WTH_legacyTaskID,
      WLI_ref_type,
      WLI_file_name,
      WLI_description,
      WLI_physical_file_name,
      WAR_resource,
      WAR_units,
      WAR_distribution,
      WAR_leadFL,
      WTO_type_enumeration,
      WTO_description,
      WTO_orderID,
      WTO_delType,
      WTO_artfType,
      WTS_WPCtaskGUID,
      WTS_created_date,
      WTS_name,
      WTS_duration,
      WTS_parentGUID,
      WTS_milestoneFL

      FROM [Methodology].[dbo].[Compliances]

      left join [Methodology].[dbo].[WPC_Compliances]
      on [CMP_GUID]=[WCM_compGUID]

      left join [Methodology].[dbo].[WorkProductComponents]
      on [WCM_wpcGUID]=[WPC_wpcGUID]

      left join [Methodology].[dbo].[WPC_Task_Relations]
      on [WPC_wpcGUID]=[WTR_wpcGUID]

      left join [Methodology].[dbo].[WPC_Tasks]
      on [WTR_WPCtaskGUID]=[WTS_WPCtaskGUID]

      left join [Methodology].[dbo].[WPC_TaskOutcomes]
      on [WTR_WPCtaskGUID]=[WTO_wpcTaskGUID]

      left join [Methodology].[dbo].[WPC_TaskDescriptions]
      on [WTH_WPCtaskGUID]=[WTS_WPCtaskGUID]

      left join [Methodology].[dbo].[WPC_Assignation]
      on [WAR_taskGUID]=[WTS_WPCtaskGUID]

      left join [Methodology].[dbo].[WPC_References]
      on [WLI_referencingTask]=[WTS_WPCtaskGUID]
      
      where  CMP_deleted is null  and [CMP_status]='Published'
      order by [CMP_name], [WTS_WBS], [WTS_orderID]
      `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get meths (compliances) phase 2
app.get("/meths", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT * FROM [Methodology].[dbo].[Compliances]
    left join ESC.dbo.Users on CMP_created_by = usr_user_ID
    where [CMP_status] = 'published'
    order by [CMP_name]
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get single meth phase 2
app.get("/cmp/:methID", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT 
      CMP_name,
      CMP_description,
      CMP_changed_date,
      CMP_created_by,
      CMP_status,
      MTD_mthdType,
      MTD_origin,
      MTD_vtcName,
      MTD_hzcName,
      MTD_practices,
      MTD_principles,
      usr_full_name

    FROM [Methodology].[dbo].[Compliances]
    left join ESC.dbo.Users on CMP_created_by = usr_user_ID

    where CMP_GUID = ${req.params.methID}
    `;
    })
    .then((result) => {
      res.send(result.recordset[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get meths line items phase 2 // revise
app.get("/cmpLIs/:methID", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT * FROM [Methodology].[dbo].MethodologyLineItems
    inner join [Methodology].[dbo].[WPC_References]
    on [WLI_usedInWPCGUID] = [MLI_wpcGUID]
    where [MLI_methGUID] = ${req.params.methID} 
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get meths plans phase 2
app.get("/cmpPlans/:methID", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT [PPV_name]
    FROM [ProjectSpace].[dbo].[ProjectPlanVersions]
    inner join [ProjectSpace].[dbo].ProjectComponents
    on [PMW_versionGUIID]=PPV_versionGUIID
    where [PMW_methGUID] = ${req.params.methID}
    `;
    })
    .then((result) => {
      var plans = [];
      for (let plan of result.recordset) {
        plans.push(plan.PPV_name);
      }
      res.send(plans);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get meths (WPCs) phase 2
app.get("/wpc", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      SELECT
        WPC_wpcGUID,
        WPC_name,
        WPC_category,
        WPC_created_by,
        WPC_status,
        CMP_GUID,
        CMP_name,
        CMP_status,
        WTO_name,
        usr_full_name

      FROM [Methodology].[dbo].[WorkProductComponents]
    
      left join [Methodology].[dbo].[WPC_Compliances]
      on [WPC_wpcGUID]=[WCM_wpcGUID]
    
      left join [Methodology].[dbo].[Compliances]
      on [WCM_wpcGUID]=[WPC_wpcGUID]
    
      left join [Methodology].[dbo].[WPC_Task_Relations]
      on [WPC_wpcGUID]=[WTR_wpcGUID]
    
      left join [Methodology].[dbo].[WPC_Tasks]
      on [WTR_WPCtaskGUID]=[WTS_WPCtaskGUID]
    
      left join [Methodology].[dbo].[WPC_TaskOutcomes]
      on [WTR_WPCtaskGUID]=[WTO_wpcTaskGUID]

      left join ESC.dbo.Users
      on WPC_created_by = usr_user_ID
      
      where  WPC_deleted is null and CMP_deleted is null and WPC_status = 'published' and CMP_status = 'published'
      order by [WPC_name]
      `;
    })
    .then((result) => {
      res.send(result.recordsets[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get meths (single WPC) phase 2
app.get("/wpc/:wpcID", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      SELECT * FROM [Methodology].[dbo].[WorkProductComponents]

      left join [Methodology].[dbo].[WPC_Compliances]
      on [WPC_wpcGUID]=[WCM_wpcGUID]

      left join ESC.dbo.Users
      on WPC_created_by = usr_user_ID
      
      where  WPC_wpcGUID = ${req.params.wpcID}
      `;
    })
    .then((result) => {
      res.send(result.recordset[0]);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get meths (single WPC's tasks) phase 2
app.get("/wpcTasks/:wpcID", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      SELECT * FROM [Methodology].[dbo].[WPC_Tasks]

      inner join Methodology.dbo.WPC_Task_Relations
      on [WTR_WPCtaskGUID] = WTS_WPCtaskGUID

      inner join Methodology.dbo.WorkProductComponents
      on WPC_wpcGUID = WTR_wpcGUID

      left join Methodology.dbo.WPC_References
      on WTS_WPCtaskGUID = WLI_referencingTask

      inner join [Methodology].[dbo].[WPC_TaskDescriptions]
      on WTS_WPCtaskGUID=WTH_WPCtaskGUID

      where WPC_wpcGUID = ${req.params.wpcID}
      `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get meths (single WPC's plans) phase 2
app.get("/wpcPlans/:wpcID", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      SELECT [PPV_name]
      FROM [ProjectSpace].[dbo].[ProjectPlanVersions]
      inner join [ProjectSpace].[dbo].ProjectComponents
      on [PMW_versionGUIID]=PPV_versionGUIID
      where [PMW_wpcGUID] = ${req.params.wpcID}
      `;
    })
    .then((result) => {
      var plans = [];
      for (let plan of result.recordset) {
        plans.push(plan.PPV_name);
      }
      res.send(plans);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get meths (single WPC's meths) phase 2
app.get("/wpcCMPs/:wpcID", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      SELECT CMP_name FROM [Methodology].[dbo].[WorkProductComponents]

      inner join Methodology.dbo.WPC_Compliances
      on WPC_wpcGUID = WCM_wpcGUID
      
      inner join Methodology.dbo.Compliances
      on CMP_GUID = WCM_compGUID
      
      where WPC_wpcGUID = ${req.params.wpcID}
      `;
    })
    .then((result) => {
      var CMPs = [];
      for (let cmp of result.recordset) {
        CMPs.push(cmp.CMP_name);
      }
      res.send(CMPs);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert meth phase 2
app.get("/insertMeth", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into Methodology.dbo.Compliances
      (
        [CMP_GUID]
        ,[CMP_type_enumeration]
        ,[CMP_name]
        ,[CMP_description]
        ,[CMP_status]
        ,[CMP_status_date]
        ,[MTD_origin]
        ,[MTD_mthdType]
        ,[MTD_principles]
        ,[MTD_practices]
        ,[MTD_hzcName]
        ,[MTD_vtcName]
        ,[CMP_owner]
        ,[CMP_created_by]
        ,[CMP_created_date]
        ,[CMP_changed_by]
        ,[CMP_changed_date]
        ,[CMP_deleted]
        ,[CMP_image]
        ,[CMP_imagePath]
      )
    values
      (
        ${req.query.cmpID},
        1,
        ${req.query.cmpName},
        ${req.query.cmpDesc},
        ${req.query.cmpStatus},
        ${req.query.date},
        ${req.query.origin},
        ${req.query.category},
        ${req.query.principles},
        ${req.query.practices},
        ${req.query.hcat},
        ${req.query.vcat},
        ${req.query.owner},
        ${req.query.owner},
        ${req.query.date},
        ${req.query.owner},
        ${req.query.date},
        NULL,
        NULL,
        NULL
      )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert line items phase 2
app.get("/insertMethLis", (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (req.query[key] === "null") {
      req.query[key] = null;
    }
  });
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into [Methodology].[dbo].[MethodologyLineItems]
    (
      [MLI_GUID]
      ,[MLI_methGUID]
      ,[MLI_orderID]
      ,[MLI_name]
      ,[MLI_description]
      ,[MLI_WBS]
      ,[MLI_work]
      ,[MLI_distribution]
      ,[MLI_wpcGUID]
      ,[MLI_parentGUID]
      ,[MLI_vertCellGUID]
      ,[MLI_horizCellGUID]
      ,[MLI_summaryFL]
      ,[MLI_timeboxFL]
      ,[MLI_outlineLevel]
      ,[MLI_duration]
      ,[MLI_phaseFL]
      ,[MLI_milestoneFL]
    )
    values
    (
      ${req.query.mliID},
      ${req.query.cmpID},
      ${req.query.order},
      ${req.query.name},
      ${req.query.desc},
      ${req.query.wbs},
      NULL,
      ${req.query.dist},
      ${req.query.wpcID},
      ${req.query.parent},
      NULL,
      NULL,
      NULL,
      ${req.query.timeboxFL},
      ${req.query.outlineLevel},
      ${req.query.duration},
      ${req.query.phaseFL},
      ${req.query.milestoneFL}
    )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert WPCs phase 2
app.get("/insertWPCs", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into [Methodology].[dbo].[WorkProductComponents]
    (
      [WPC_wpcGUID]
      ,[WPC_name]
      ,[WPC_description]
      ,[WPC_category]
      ,[WPC_status]
      ,[WPC_status_date]
      ,[WPC_industrySegment]
      ,[WPC_businessProblem]
      ,[WPC_bestWork]
      ,[WPC_bestDuration]
      ,[WPC_owner]
      ,[WPC_created_by]
      ,[WPC_created_date]
      ,[WPC_changed_by]
      ,[WPC_changed_date]
      ,[WPC#]
      ,[WPC_deleted]
    )
    values
    (
      ${req.query.wpcID},
      ${req.query.name},
      ${req.query.desc},
      ${req.query.category},
      ${req.query.status},
      ${req.query.date},
      NULL,
      NULL,
      NULL,
      NULL,
      ${req.query.owner},
      ${req.query.owner},
      ${req.query.date},
      ${req.query.owner},
      ${req.query.date},
      NULL,
      NULL
    )

    insert into [Methodology].[dbo].WPC_Compliances
    (
      WCM_wpcGUID, 
      WCM_compGUID
    )
    values
    (
      ${req.query.wpcID},
      ${req.query.cmpID}
    )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert WPCs compliance phase 2
app.get("/insertWPCc", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into [Methodology].[dbo].WPC_Compliances
    (
      WCM_wpcGUID, 
      WCM_compGUID
    )
    values
    (
      ${req.query.wpcID},
      ${req.query.cmpID}
    )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert WPCs tasks phase 2
app.get("/insertWPCt", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into [Methodology].[dbo].WPC_Tasks
      (
        WTS_parentGUID, 
        WTS_name, 
        WTS_description, 
        WTS_duration, 
        WTS_orderID, 
        WTS_WBS, 
        WTS_work, 
        WTS_criticalFL, 
        WTS_summaryFL,
        WTS_milestoneFL, 
        WTS_timeboxFL, 
        WTS_taskType, 
        WTS_distributionWork, 
        WTS_outlineLevel, 
        WTS_created_by, 
        WTS_created_date, 
        WTS_changed_by, 
        WTS_changed_date, 
        WTS_WPCtaskGUID
      )
    values
      (
        ${req.query.parent}, 
        ${req.query.name}, 
        ${req.query.desc}, 
        ${req.query.duration}, 
        ${req.query.order}, 
        ${req.query.wbs}, 
        NULL, 
        NULL, 
        NULL, 
        ${req.query.milestone}, 
        ${req.query.timebox}, 
        NULL, 
        ${req.query.distribution}, 
        1, 
        ${req.query.owner}, 
        ${req.query.date}, 
        ${req.query.owner}, 
        ${req.query.date}, 
        ${req.query.taskID}
      )

    insert into Methodology.dbo.WPC_TaskDescriptions
      (
        WTH_purpose, 
        WTH_input, 
        WTH_output, 
        WTH_how_to, 
        WTH_legacyTaskID, 
        WTH_WPCtaskGUID
      )
    values
      (
        ${req.query.purpose}, 
        ${req.query.input}, 
        ${req.query.output}, 
        ${req.query.how}, 
        ${req.query.legacyID}, 
        ${req.query.taskID}
      )
    
    insert into Methodology.dbo.WPC_Task_Relations
      (
        WTR_type, 
        WTR_wpcGUID, 
        WTR_WPCtaskGUID
      )
    values
      (
        'contains',
        ${req.query.wpcID},
        ${req.query.taskID}
      )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert WPCs tasks outcomes phase 2
app.get("/insertWPCto", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into Methodology.dbo.WPC_TaskOutcomes
      (
        WTO_name, 
        WTO_orderID, 
        WTO_description, 
        WTO_searchFL, 
        WTO_created_by, 
        WTO_created_date, 
        WTO_changed_by, 
        WTO_changed_date, 
        WTO_wpcTaskGUID, 
        WTO_type_enumeration, 
        WTO_artifGUID
      )
    values
      (
        ${req.query.Oname}, 
        ${req.query.Oorder}, 
        ${req.query.Odesc}, 
        ${req.query.search}, 
        ${req.query.owner}, 
        ${req.query.date}, 
        ${req.query.owner}, 
        ${req.query.date}, 
        ${req.query.taskID}, 
        0, 
        ${req.query.oID}
      )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/test", (req, res) => {
  res.send(NULL);
});

//insert ProjectComponents
app.get("/ProjectComponentsInsert", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (req.query[key] === "null") {
      req.query[key] = null;
    }
  });
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      INSERT INTO ProjectSpace.dbo.ProjectComponents
      (
        [PMW_pcompGUID]
        ,[PMW_versionGUIID]
        ,[PMW_name]
        ,[PMW_nameType]
        ,[PMW_created_date]
        ,[PMW_wpcGUID]
        ,[PMW_methGUID]
      )
      VALUES
      (${req.query.pcID},${req.query.vID},${req.query.name},${req.query.type},
        ${req.query.date},${req.query.wpcID},${req.query.methID})
      `;
    })
    .then((result) => {
      res.send(result.recordsets);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert ProjectComponents tasks
app.get("/ComponentTasksInsert", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (req.query[key] === "null") {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      ALTER TABLE ProjectSpace.dbo.ProjectTaskDetails NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.ProjectComponentTasks
      (
        [PCT_ctaskGUID]
        ,[PCT_pcompGUID]
        ,[PCT_parentGUID]
        ,[PCT_name]
        ,[PCT_orderID]
        ,[PCT_outlineLevel]
        ,[PCT_WBS]
        ,[PCT_work]
        ,[PCT_summaryFL]
        ,[PCT_distributionWork]
        ,[PCT_WPCtaskGUID]
        ,[PCT_mliGUID]
        ,[PCT_horizontalCat]
        ,[PCT_horizontalCatCellName]
        ,[PCT_verticalCat]
        ,[PCT_verticalCatCellName]
        ,[PCT_cumDistribution]
      )
      VALUES
      (${req.query.ctID},${req.query.pcID},${req.query.pID},${req.query.name},${req.query.oID},${req.query.outline},
        ${req.query.wbs},${req.query.work},${req.query.sum},${req.query.detribution},${req.query.tID},${req.query.liID},
        ${req.query.hc},NULL,${req.query.vc},NULL,NULL)
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert meths (tasks)
app.get("/tasksInsert", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (req.query[key] === "null") {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      ALTER TABLE ProjectSpace.dbo.ProjectTaskDetails NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.ProjectTasks
      (
        [PRT_taskGUID]
        ,[PRT_versionGUIID]
        ,[PRT_orderID]
        ,[PRT_name]
        ,[PRT_description]
        ,[PRT_WBS]
        ,[PRT_work]
        ,[PRT_duration]
        ,[PRT_critical]
        ,[PRT_summary]
        ,[PRT_taskType]
        ,[PRT_distributionWork]
        ,[PRT_outlineLevel]
        ,[PRT_timeboxFL]
        ,[PRT_parentGUID]
        ,[PRT_ctaskGUID]
        ,[WTS_milestoneFL]
      )
      VALUES
      (${req.query.tID},${req.query.vID},${req.query.oID},${req.query.name},${req.query.desc},
        ${req.query.wbs},${req.query.work},${req.query.duration},${req.query.crit},${req.query.sum},
        ${req.query.type},${req.query.detribution},${req.query.outline},${req.query.timebox},
        ${req.query.pID},${req.query.ctID},${req.query.milestoneFL})
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert meths (tasks) details
app.get("/tasksInsertDetails", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (req.query[key] === "null") {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
     
      ALTER TABLE ProjectSpace.dbo.ProjectTaskDetails NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.ProjectTaskDetails
      (
        [PTD_taskGUID]
        ,[PTD_purpose]
        ,[PTD_input]
        ,[PTD_output]
        ,[PTD_how_to]
        ,[PTD_legacyTaskID]
      )
      VALUES
      (${req.query.tID},${req.query.purpose},${req.query.input},${req.query.output},${req.query.how},
        ${req.query.legacyTaskID})

      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert meths (tasks) refs
app.get("/tasksInsertRefs", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (req.query[key] === "null") {
      req.query[key] = null;
    }
  });
  var rID = await uuid.v4();
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
     
      ALTER TABLE ProjectSpace.dbo.ProjectTaskReferences NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.ProjectTaskReferences
      (
        [PTR_refGUID]
        ,[PTR_projGUID]
        ,[PTR_versionGUID]
        ,[PTR_taskGUID]
        ,[PTR_liGUID]
        ,[PTR_refType]
        ,[PTR_fileName]
        ,[PTR_description]
        ,[PTR_physical_fileName]
      )
        VALUES
        (${rID},${req.query.projID},${req.query.vID},${req.query.tID},${req.query.lID},
          ${req.query.refType},${req.query.fileName},${req.query.fileDesc},${req.query.physical})

      
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert meths (tasks) assignments
app.get("/tasksInsertAssign", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (req.query[key] === "null") {
      req.query[key] = null;
    }
  });

  var aID = await uuid.v4();

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`

      
      ALTER TABLE ProjectSpace.dbo.ProjectTaskAssignments NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.ProjectTaskAssignments
      (
        [ASN_GUID]
        ,[ASN_resourceName]
        ,[ASN_projGUID]
        ,[ASN_taskGUID]
        ,[ASN_units]
        ,[ASN_unitsSet]
        ,[ASN_distribution]
        ,[ASN_leadFL]
        ,[ASN_groupInd]
      )
        VALUES
        (${aID},${req.query.resourceName},${req.query.projID},${req.query.tID},${req.query.unit},
          NULL,${req.query.distribution},${req.query.leadFL},NULL)

      
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert meths (tasks) TWP
app.get("/tasksInsertTWP", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (req.query[key] === "null") {
      req.query[key] = null;
    }
  });

  var artifID = await uuid.v4();

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      
      ALTER TABLE ProjectSpace.dbo.TaskWorkProducts NOCHECK CONSTRAINT ALL
      INSERT INTO ProjectSpace.dbo.TaskWorkProducts
      (
        [TWP_artifGUID]
        ,[TWP_taskGUID]
        ,[TWP_type_enumeration]
        ,[TWP_name]
        ,[TWP_description]
        ,[TWP_orderID]
        ,[TWP_delType]
        ,[TWP_artfType]
      )
        VALUES
        (${artifID},${req.query.tID},${req.query.enumeration},${req.query.TWPname},${req.query.TWPdesc},
          ${req.query.orderID},${req.query.delType},${req.query.artfType})

        
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get WPC's tasks outcome phase 2
app.get("/taskOutComes/:taskID", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      SELECT * FROM [Methodology].[dbo].[WPC_TaskOutcomes]
      where WTO_wpcTaskGUID = ${req.params.taskID}
      `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// edit WPC phase 2
app.get("/editWPC", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      UPDATE Methodology.dbo.WorkProductComponents
      SET 
      [WPC_name]=${req.query.name},
      [WPC_description]=${req.query.desc},
      [WPC_status]=${req.query.status},
      [WPC_changed_by]=${req.query.owner},
      [WPC_changed_date]=${req.query.date},
      [WPC_category]=${req.query.category}
      WHERE WPC_wpcGUID=${req.query.wpcID}

      if exists (select * from [Methodology].[dbo].WPC_Compliances where WCM_compGUID=${req.query.cmpID} and WCM_wpcGUID = ${req.query.wpcID})
      begin
        select * from [Methodology].[dbo].WPC_Compliances where WCM_compGUID=${req.query.cmpID} and WCM_wpcGUID = ${req.query.wpcID}
      end
      else
      begin
      insert into [Methodology].[dbo].WPC_Compliances
        (WCM_compGUID,WCM_wpcGUID) values (${req.query.cmpID},${req.query.wpcID})
      end
      `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//edit WPC's tasks phase 2
app.get("/editWPCt", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    update [Methodology].[dbo].WPC_Tasks
    set
      WTS_parentGUID=${req.query.parent}, 
      WTS_name=${req.query.name}, 
      WTS_description=${req.query.desc}, 
      WTS_duration=${req.query.duration}, 
      WTS_orderID=${req.query.order}, 
      WTS_WBS=${req.query.wbs}, 
      WTS_milestoneFL=${req.query.milestone}, 
      WTS_timeboxFL=${req.query.timebox}, 
      WTS_distributionWork=${req.query.distribution}, 
      WTS_changed_by=${req.query.owner}, 
      WTS_changed_date=${req.query.date}

    where WTS_WPCtaskGUID=${req.query.taskID}

    update Methodology.dbo.WPC_TaskDescriptions
    set
      WTH_purpose=${req.query.purpose}, 
      WTH_input=${req.query.input}, 
      WTH_output=${req.query.output}, 
      WTH_how_to=${req.query.how}
        
    where WTH_WPCtaskGUID=${req.query.taskID}
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//edit WPCs tasks outcomes phase 2
app.get("/editWPCto", (req, res) => {
  sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    update Methodology.dbo.WPC_TaskOutcomes
    set
      WTO_name=${req.query.Oname}, 
      WTO_orderID=${req.query.Oorder}, 
      WTO_description=${req.query.Odesc}, 
      WTO_searchFL=${req.query.search}, 
      WTO_changed_by=${req.query.owner}, 
      WTO_changed_date=${req.query.date}

    where WTO_artifGUID=${req.query.oID}
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// Estimator

//get estimates phase 2
app.get("/estimates", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT 
      PPV_versionGUIID
      ,CPJ_client_name
      ,CPJ_name
      ,CPJ_projGUID
      ,PPV_name
      ,PPV_version
      ,PPV_versionDate
      ,PPV_status
      ,EVR_estGUID
      ,EVR_name
      ,EVR_owner
      ,EVR_work
      ,EVR_costTotal
      ,EVR_created_date
    
    FROM ProjectSpace.dbo.ProjectPlanVersions

    inner join ProjectSpace.dbo.CandidateProjects
    on PPV_projGUID = CPJ_projGUID
    inner join ProjectSpace.dbo.EstimateVersions
    on PPV_versionGUIID = EVR_versionGUID

    order by PPV_name
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get estimate phase 2
app.get("/estimate/:estID", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT 
      [EVR_estGUID]
      ,[EVR_versionGUID]
      ,[EVR_name]
      ,[EVR_description]
      ,[EVR_validProjDate]
      ,[EVR_costTotal]
      ,[EVR_work]
      ,[EVR_owner]
      ,[EVR_changed_date]
      ,[EVR_status]
      ,PPV_name
      ,PPV_version
      ,PPV_status
      ,CPJ_name
      ,CPJ_client_name
      
    FROM [ProjectSpace].[dbo].[EstimateVersions]
    
    inner join [ProjectSpace].[dbo].ProjectPlanVersions
    on [EVR_versionGUID] = [PPV_versionGUIID]
    
    inner join [ProjectSpace].[dbo].CandidateProjects
    on PPV_projGUID = CPJ_projGUID
    
    where [EVR_estGUID] = ${req.params.estID}
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get estimate resources phase 2
app.get("/estimateRes/:estID", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT 
      [ERQ_estReqGUID]
      ,[PRT_taskGUID]
      ,[ERQ_estGUID]
      ,[ERQ_pcompGUID]
      ,[ERQ_estimateMethod]
      ,[ERQ_workSumEstimated]
      ,[ERQ_workSumDistributed]
      ,[ERQ_workSumEdited]
      ,[ERQ_costSumEdited]
      ,[ERQ_name]
      ,[ERQ_estimationBasics]
      ,[ERQ_orderID]
      ,[ERQ_componentType]
      ,[ERQ_wbs]

    FROM [ProjectSpace].[dbo].[EstimateRequests]

    left join [ProjectSpace].[dbo].[ProjectTasks]
    on [PRT_name]=[ERQ_name]

    where [ERQ_estGUID] = ${req.params.estID} and [ERQ_componentType] = 'T'
    order by ERQ_orderID
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert estimate version
app.get("/createEST", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into [ProjectSpace].[dbo].[EstimateVersions]
    (
      [EVR_estGUID]
      ,[EVR_versionGUID]
      ,[EVR_name]
      ,[EVR_description]
      ,[EVR_validProjDate]
      ,[EVR_costTotal]
      ,[EVR_work]
      ,[EVR_owner]
      ,[EVR_created_by]
      ,[EVR_created_date]
      ,[EVR_changed_by]
      ,[EVR_changed_date]
      ,[EVR_deleted]
      ,[EVR_status]
    )
    values
    (
      ${req.query.estID},
      ${req.query.vid},
      ${req.query.name},
      ${req.query.desc},
      ${req.query.projDate},
      ${req.query.cost},
      ${req.query.work},
      ${req.query.owner},
      ${req.query.owner},
      ${req.query.date},
      NULL,
      NULL,
      NULL,
      ${req.query.status}
    )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//update estimate version
app.get("/updateEST", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    update 
      [ProjectSpace].[dbo].[EstimateVersions]
    SET
      [EVR_name] = ${req.query.name}
      ,[EVR_description] = ${req.query.desc}
      ,[EVR_costTotal] = ${req.query.cost}
      ,[EVR_work] = ${req.query.work}
      ,[EVR_changed_by] = ${req.query.user}
      ,[EVR_changed_date] = ${req.query.date}
      ,[EVR_status] = ${req.query.status}

      where EVR_estGUID = ${req.query.estID}
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert estimate requests
app.get("/createESTreq", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into [ProjectSpace].[dbo].[EstimateRequests]
    (
      [ERQ_estReqGUID]
      ,[ERQ_estGUID]
      ,[ERQ_pcompGUID]
      ,[ERQ_estimateMethod]
      ,[ERQ_workSumEstimated]
      ,[ERQ_workSumDistributed]
      ,[ERQ_workSumEdited]
      ,[ERQ_costSumEdited]
      ,[ERQ_name]
      ,[ERQ_estimationBasics]
      ,[ERQ_orderID]
      ,[ERQ_componentType]
      ,[ERQ_wbs]
    )
    values
    (
      ${req.query.estReqID},
      ${req.query.estID},
      NULL,
      ${req.query.model},
      ${req.query.estimated},
      ${req.query.distributed},
      ${req.query.final},
      ${req.query.cost},
      ${req.query.name},
      ${req.query.basis},
      ${req.query.order},
      'T',
      ${req.query.wbs}
    )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//update estimate requests
app.get("/updateESTreq", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    update 
      [ProjectSpace].[dbo].[EstimateRequests]
    SET
      ,[ERQ_estimateMethod] = ${req.query.model}
      ,[ERQ_workSumEstimated] = ${req.query.estimated}
      ,[ERQ_workSumDistributed] = ${req.query.distributed}
      ,[ERQ_workSumEdited] = ${req.query.final}
      ,[ERQ_costSumEdited] = ${req.query.cost}
      ,[ERQ_name] = ${req.query.name}
      ,[ERQ_estimationBasics] = ${req.query.basis}

      where ERQ_estReqGUID = ${req.query.estReqID}
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert estimate task works
app.get("/createESTtw", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into [ProjectSpace].[dbo].[EstimateTaskWork]
    (
      [ETW_etwGUID]
      ,[ETW_parentetwGUID]
      ,[ETW_estGUID]
      ,[ETW_estReqGUID]
      ,[ETW_taskGUID]
      ,[ETW_parentTaskGUID]
      ,[ETW_projCompGUID]
      ,[ETW_workDistributed]
      ,[ETW_workEdited]
      ,[ETW_cost]
      ,[ETW_orderID]
      ,[ETW_WBS]
      ,[ETW_taskName]
    )
    values
    (
      ${req.query.etwGUID},
      NULL,
      ${req.query.estID},
      ${req.query.estReqID},
      ${req.query.taskID},
      ${req.query.parent},
      ${req.query.compID},
      ${req.query.work},
      ${req.query.final},
      ${req.query.cost},
      ${req.query.order},
      ${req.query.wbs},
      ${req.query.taskName}
    )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//update estimate task works
app.get("/updateESTtw", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    update 
      [ProjectSpace].[dbo].[EstimateTaskWork]
    SET
      [ETW_workDistributed] = ${req.query.ditributed}
      ,[ETW_workEdited] = ${req.query.final}
      ,[ETW_cost] = ${req.query.cost}

    where ETW_estReqGUID = ${req.query.estReqID}
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert estimate results
app.get("/createESTres", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into [ProjectSpace].[dbo].[EstimateResults]
    (
      [ERS_GUID]
      ,[ERS_estReqGUID]
      ,[ERS_asnGUID]
      ,[ERS_workDistributed]
      ,[ERS_workEdited]
      ,[ERS_comments]
      ,[ERS_cost]
      ,[ERS_orderID]
      ,[ERS_WBS]
      ,[ERS_taskName]
      ,[ERS_resourceName]
      ,[ERS_groupInd]
      ,[ERS_cummDistribution]
      ,[ERS_etwGUID]
    )
    values
    (
      ${req.query.ersID},
      ${req.query.estReqID},
      ${req.query.asnID},
      ${req.query.distributed},
      ${req.query.final},
      NULL,
      ${req.query.cost},
      ${req.query.order},
      ${req.query.wbs},
      ${req.query.taskName},
      ${req.query.resourceName},
      ${req.query.group},
      1,
      ${req.query.etwGUID}
    )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//update estimate results
app.get("/updateESTres", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    update 
      [ProjectSpace].[dbo].[EstimateResults]
    SET
      [ERS_workDistributed] = ${req.query.distributed}
      ,[ERS_workEdited] = ${req.query.final}
      ,[ERS_cost] = ${req.query.cost}

    where ERS_estReqGUID = ${req.query.estReqID}
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//insert estimate hourly rates
app.get("/createESTrates", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    insert into [ProjectSpace].[dbo].[EstimateHourlyRates]
    (
      [EHR_rateGUID]
      ,[EHR_estGUID]
      ,[EHR_resourceName]
      ,[EHR_projGUID]
      ,[EHR_groupInd]
      ,[EHR_rate]
      ,[EHR_cost]
    )
    values
    (
      ${req.query.rateID},
      ${req.query.estID},
      ${req.query.resourceName},
      ${req.query.pid},
      ${req.query.group},
      ${req.query.rate},
      ${req.query.cost}
    )
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//update estimate hourly rates
app.get("/updateESTrates", async (req, res) => {
  Object.keys(req.query).forEach((key) => {
    if (
      req.query[key] === "null" ||
      req.query[key] === "undefined" ||
      !req.query[key]
    ) {
      req.query[key] = null;
    }
  });

  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    update 
      [ProjectSpace].[dbo].[EstimateHourlyRates]
    SET
      [EHR_rate] = ${req.query.rate}
      ,[EHR_cost] = ${req.query.cost}

    where EHR_resourceName = ${req.query.name} and EHR_estGUID = ${req.query.estID}
    `;
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// custom

// get user project plans
app.get("/userProjects/:userName", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      select * from ProjectSpace.dbo.CandidateProjects
      inner join ProjectSpace.dbo.ProjectPlanVersions
      on CPJ_projGUID = PPV_projGUID
      inner join ESC.dbo.Users
      on PPV_created_by = usr_user_ID
      where CPJ_deleted is null and PPV_deleted is null and usr_user_ID = ${req.params.userName} and ppv_status = 'published'
      order by CPJ_name
      `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get user meths
app.get("/userMeths/:userName", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT * FROM [Methodology].[dbo].[Compliances]
    where CMP_created_by = ${req.params.userName} and CMP_status = 'published'
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get user WPCs
app.get("/userWPCs/:userName", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT * FROM [Methodology].[dbo].[WorkProductComponents]
    where [WPC_created_by] = ${req.params.userName} and WPC_status = 'published'
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get user librabry items
app.get("/userLi/:userName", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select LIV_verGUID, LIV_fileLocation, LIV_createdDate, LIV_liGUID
    from LibraryCatalog.dbo.LibraryItemVersions
    where LIV_created_by = ${req.params.userName}
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get Library item for LinerChart
app.get("/liChart/", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
      select LIV_createdDate, LIV_fileLocation, COUNT(LIV_createdDate) as often from LibraryCatalog.dbo.LibraryItemVersions
      group by LIV_createdDate, LIV_fileLocation order by often desc
      `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get user favorite librabry items
app.get("/userFavLi/:userName", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select LIV_verGUID, LIV_fileLocation, LIV_createdDate, LIV_liGUID
    from LibraryCatalog.dbo.LibraryItemVersions

    inner join LibraryCatalog.dbo.Favorites
    on LIV_liGUID = LibraryItemId

    where UserId = (select top 1 usr_RECID from ESC.dbo.Users where usr_full_name = ${req.params.userName})
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get user downloaded librabry items
app.get("/userDownloadedLi/:userID", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select LIV_verGUID, LIV_fileLocation, LIV_createdDate, LIV_liGUID
    from LibraryCatalog.dbo.OftenDownloaded
    inner join LibraryCatalog.dbo.LibraryItemVersions
    on LIV_verGUID = LIVerId
    where UserId = ${req.params.userID}
    order by LIV_verGUID
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get top downloaded librabry items
app.get("/topDownloadedLi", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select top 10 LIV_verGUID, LI_title, LIV_version, LIV_liGUID, COUNT(*) as often from LibraryCatalog.dbo.OftenDownloaded
    inner join LibraryCatalog.dbo.LibraryItemVersions
    on LIV_verGUID = LIVerId
    inner join LibraryCatalog.dbo.LibraryItems
    on LIV_liGUID = LI_liGUID
    group by LIV_verGUID, LI_title, LIV_version, LIV_liGUID
    order by often desc
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get top WPCs
app.get("/topWPCs", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    select distinct top 10 PMW_name, PMW_wpcGUID, WPC_category, COUNT(*) as often from ProjectSpace.dbo.ProjectComponents
    inner join ProjectSpace.dbo.ProjectPlanVersions
    on PPV_versionGUIID = PMW_versionGUIID
    inner join Methodology.dbo.WorkProductComponents
    on PMW_wpcGUID = WPC_wpcGUID
    inner join Methodology.dbo.WPC_Compliances
    on WPC_wpcGUID = WCM_wpcGUID
    inner join Methodology.dbo.Compliances
    on WCM_compGUID = CMP_GUID
    where PMW_nameType = 'w'
    group by  PMW_name, PMW_wpcGUID, WPC_category
    order by often desc
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get top Project Resources
app.get("/topResources", async (req, res) => {
  await sql
    .connect(SQLconfig)
    .then(() => {
      return sql.query`
    SELECT TOP 10 [SRT_description], COUNT(*) as often
    FROM [ProjectSpace].[dbo].[SymbolicResources]
    group by [SRT_description]
    order by often desc
    `;
    })
    .then((result) => {
      res.send(result.recordset);
    })
    .catch((err) => {
      res.send(err);
    });
});
app.listen(port, () => console.log(`app listening on port ${port}`));
