import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CallapiService {
  constructor(private http: HttpClient) {

  }

  // ************************************

  getDomains() {
    let domains = 'http://localhost:8080/domains'
    return this.http.get(domains)
  }
  //get admin data

  getAdmin() {
    let adminUrl = 'http://localhost:8080/admin'
    return this.http.get(adminUrl);
  }

  // get knowledge library

  getLi() {
    let liUrl = 'http://localhost:8080/LIs'
    return this.http.get(liUrl)
  }

  // get componenets
  getComp() {
    let compUrl = 'http://localhost:8080/wpc'
    return this.http.get(compUrl)
  }


  //get Methodology

  getMeths() {
    let methsUrl = 'http://localhost:8080/meths'
    return this.http.get(methsUrl)
  }


  // get projects

  getProjects() {
    let proUrl = 'http://localhost:8080/projects'
    return this.http.get(proUrl)
  }

  // get configuratar

  getConf() {
    let confUrl = 'http://localhost:8080/projectsWithPlans'
    return this.http.get(confUrl)
  }

  // get estimates

  getEst() {
    let estUrl = 'http://localhost:8080/estimates'
    return this.http.get(estUrl)
      ;
  }

  // ************************************

  // ***************************************
  // admin page url start
  //************************************* */


  //get projects of clients

  getClientsPro() {
    let cliProUrl = 'http://localhost:8080/clientsProjects'
    return this.http.get(cliProUrl)
  }

  // get projects and their plans

  getProPlans() {
    let proPlans = 'http://localhost:8080/projectsPlans'
    return this.http.get(proPlans)
  }
  // get library item per years (2019,2020,2021)
  getLipItem() {
    let lipItem = 'http://localhost:8080/liYears'
    return this.http.get(lipItem)
  }

  // get library item types
  getLipItemType() {
    let lipItemTy = 'http://localhost:8080/liTypes'
    return this.http.get(lipItemTy)
  }
  //********************************************** */
  // admin page url end
  //**************************************************
  // project url start
  //******************** */

  //get single project

  getSingPro(projID: any) {
    let singPro = `http://localhost:8080/project?projID=${projID}`
    return this.http.get(singPro)
  }

  //get project stakeholders

  getProStak(projID: any) {
    let proStak = `http://localhost:8080/stakeholders?projID=${projID}`
    return this.http.get(proStak)
  }
  //get project ScopeRecords
  getProScopeRe(projID: any) {
    let proScopRe = `http://localhost:8080/scope?projID=${projID}`
    return this.http.get(proScopRe)
  }
  //get project goals

  getProGoal(projID: any) {
    let proGoal = `http://localhost:8080/goal?projID=${projID}`
    return this.http.get(proGoal)
  }
  //get goal objectives
  getGoalObjec(goalID: any) {
    let goalObjec = `http://localhost:8080/objectives?goalID=${goalID}`
    return this.http.get(goalObjec)
  }

  //get clinet's projects

  getClinetProjects(client: any) {
    let clientPro = `http://localhost:8080/clientProjects?client=${client}`
    return this.http.get(clientPro)
  }
  // get a single project data

  getProject(id: any) {
    let singlePro = `http://localhost:8080/project?projID=${id}`
    return this.http.get(singlePro)
  }
  // get single project with plan
  getProjectData(projID: any, vID: any) {
    let proData = `http://localhost:8080/projectWithPlan?projID=${projID}&vID=${vID}`
    return this.http.get(proData)
  }
  // get plan's tasks

  getProtask(vID: any) {
    let proTask = `http://localhost:8080/projectTasks?projID=${vID}`
    return this.http.get(proTask)
  }


  //get single project tasks gantt

  getGantt() {
    let ganttUrl = 'http://localhost:8080/gantt'
    return this.http.get(ganttUrl)
  }

  // get tasks resources
  getTaskRes(taskID: any) {
    let taskRes = `http://localhost:8080/taskResources?taskID=${taskID}`
    return this.http.get(taskRes)
  }

  // get WPC's tasks outcome
  getTaskWpcOut(taskID: any) {
    let wpcTaskOut = `http://localhost:8080/taskOutComes?taskID=${taskID}`
    return this.http.get(wpcTaskOut)
  }



  //get single project tasks gantt (test)

  getSingleGantt(tName: any) {
    let singleGantt = `http://localhost:8080/taskComp?tName=${tName}`
    return this.http.get(singleGantt)
  }

  //get task refs

  getTaskRefs(taskID: any) {
    let taskRefs = `http://localhost:8080/taskRefs?taskID=${taskID}`
    return this.http.get(taskRefs)
  }

  //**************************************************
  // project url end
  //******************** */

  //**************************************************
  //  componenets url start
  //**************************************************
  //get meths (single WPC)

  getSingleWpc(wpcID: any) {
    let singleWpc = `http://localhost:8080/wpc/${wpcID}`
    return this.http.get(singleWpc)
  }

  //get meths (single WPC's tasks)
  geWpcTask(wpcID: any) {
    let singleWpcTask = `http://localhost:8080/wpcTasks/${wpcID}`
    return this.http.get(singleWpcTask)
  }
  // get WPC's tasks outcome
  getTOutComes(taskID: any) {
    let taskOutComes = `http://localhost:8080/wpcTasks/${taskID}`
    return this.http.get(taskOutComes)
  }
  // get plans that use this wpc
  getPlansWpc(wpcID: any) {
    let wpcPlans = `http://localhost:8080/wpcPlans/${wpcID}`
    return this.http.get(wpcPlans)
  }
  // get methodologies that use this wpc
  getMethWpc(wpcID: any) {
    let wpcMath = `http://localhost:8080/wpcCMPs/${wpcID}`
    return this.http.get(wpcMath)
  }
  //**************************************************
  //  componenets url end
  //**************************************************
  //**************************************************
  // Library Catalog queries
  //**************************************************

  // get single libraby Item

  getSingleLiItem(liID: any) {
    let LiItem = `http://localhost:8080/LIsFilterd?liID${liID}`
    return this.http.get(LiItem)
  }

  // get filtered libraby Items

  getFilterLib(filter: any) {
    let filterLib = `http://localhost:8080/LIsFilterd?filter${filter}`
    return this.http.get(filterLib)
  }

  // get single libraby Item ratings
  getLiItemRating(liID: any) {
    let LiItemRating = `http://localhost:8080/LIrate?liID${liID}`
    return this.http.get(LiItemRating)
  }

  // get single libraby Item WPC
  getLiItemWpc(liID: any) {
    let LiItemWpc = `http://localhost:8080/LiWPC?liID${liID}`
    return this.http.get(LiItemWpc)
  }
  // get single libraby Item ProjectPlan
  getProjectLi(liID: any) {
    let proLi = `http://localhost:8080/LiProject?liID${liID}`
    return this.http.get(proLi)
  }
  // get class refrences
  getClassRefren() {
    let ClassUrl = 'http://localhost:8080/classRefs'
    return this.http.get(ClassUrl);
  }
  // get type refrences
  getTypeRef(className: any) {
    let typeRefurl = `http://localhost:8080/typeRefs?className${className}`
    return this.http.get(typeRefurl)
  }
  // get genre refrences
  getGenRef(typeName: any) {
    let genRefUrl = `http://localhost:8080/genreRefs?className${typeName}`
    return this.http.get(genRefUrl)
  }
  /********************************** */
  //Methodology

  // most used methodologies

  getMostMeths() {
    let mostUrl = 'http://localhost:8080/methMost'
    return this.http.get(mostUrl)
  }
  //get single meth
  getSingleMeth(methID: any) {
    let singleMath = `http://localhost:8080/cmp/${methID}`
    return this.http.get(singleMath)
  }
  //get meths line items

  getMathLine(methID: any) {
    let mathLine = `http://localhost:8080/cmpLIs/${methID}`
    return this.http.get(mathLine)
  }
  //get meths plans

  getMathPlans(methID: any) {
    let mathPlans = `http://localhost:8080/cmpPlans/${methID}`
    return this.http.get(mathPlans)
  }

  //*********************************************************************** */
  // Estimator
  //get one estimate
  getEstimate(estID: any) {
    let singleEst = `http://localhost:8080/estimate/${estID}`
    return this.http.get(singleEst)
  }
  //get estimate resources
  getEstRes(estID: any) {
    let estRes = `http://localhost:8080/estimateRes/${estID}`
    return this.http.get(estRes)
  }

  /************************************* */
  // users
  /*********************************** */
  //get user data

  getUser(id: any) {
    let userUrl = `http://localhost:8080/user?id=${id}`
    return this.http.get(userUrl)
  }
  // get user favorites
  getUserFav(userID: any) {
    let userFavurl = `http://localhost:8080/favLI?userID${userID}`
    return this.http.get(userFavurl)
  }
  // get user project plans
  getUserProPlans(userName: any) {
    let userProPlans = `http://localhost:8080/userProjects/userName${userName}`
    return this.http.get(userProPlans)
  }
  // get user meths

  getUserMath(userName: any) {
    let userMath = `http://localhost:8080/userMeths/userName${userName}`
    return this.http.get(userMath)
  }
  // get user WPCs

  getUserWpcs(userName: any) {
    let userWpcs = `http://localhost:8080/userWPCs/userName${userName}`
    return this.http.get(userWpcs)
  }


  // get user librabry items
  getUserLiItems(userName: any) {
    let userLiItems = `http://localhost:8080/userLi/userName${userName}`
    return this.http.get(userLiItems)
  }

  // get user favorite librabry items
  getUserFavIcon(userName: any) {
    let userLiItems = `http://localhost:8080/userFavLi/userName${userName}`
    return this.http.get(userLiItems)
  }

  // get user downloaded librabry items
  getUserDownLiItem(userID: any) {
    let userDownLiItem = `http://localhost:8080/userDownloadedLi/userID${userID}`
    return this.http.get(userDownLiItem)
  }
  /********************************************* */
  // get top downloaded librabry items
  getTopDownloaded() {
    let topDownload = `http://localhost:8080/topDownloadedLi`
    return this.http.get(topDownload)
  }

  // get Library item for LinerChart
  getLiItemChart() {
    let liItemChart = `http://localhost:8080/liChart`
    return this.http.get(liItemChart)
  }
  // get top WPCs
  getTopWpcs() {
    let topWpcs = `http://localhost:8080/topWPCs`
    return this.http.get(topWpcs)
  }
  // get top Project Resources
  getTopProjectRes() {
    let topProRes = `http://localhost:8080/topResources`
    return this.http.get(topProRes)
  }
}
