import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CallapiService {
  constructor(private http: HttpClient) {

  }

  // ************************************


  //get user data

  getUser(id: any) {
    let userUrl = `http://localhost:8080/user?id=${id}`
    return this.http.get(userUrl)
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


  // get class refrences
  getClassRefren() {
    let ClassUrl = 'http://localhost:8080/classRefs'
    return this.http.get(ClassUrl);
  }

  // get gantt

  getGantt() {
    let ganttUrl = 'http://localhost:8080/gantt'
    return this.http.get(ganttUrl)
  }

  // get project details and assign data

  getProjectDetails(projID: any) {
    let proData = `http://localhost:8080/project?projID=${projID}`
    return this.http.get(proData)
  }

  // get stake holders




}




