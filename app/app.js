angular.module('myapp', ['ui.router','ngSanitize'])
.config(function($stateProvider, $urlRouterProvider, $locationProvider, USER_ROLES) {
  // $locationProvider.hashPrefix('')
  // $locationProvider.html5Mode('true')
  $urlRouterProvider.otherwise('error404');

  $stateProvider
    .state('common', {
      url : '/',
      template: '<common></common>',
      data : {
        authorizedRoles : [USER_ROLES.admin, USER_ROLES.editor]
      }
    })
      .state('contacts', {
        parent: 'common',
        url : 'contacts',
        template: '<contacts data-contacts="$ctrl.contacts"></contacts>',
        resolve: {
          resGetContacts : 'resGetContacts'
        },
        controller: function( resGetContacts){
          this.contacts = resGetContacts.data;
        },
        controllerAs : '$ctrl'
      })
      .state('profile', {
        parent: 'common',
        url : 'profile/:pid',
        template: '<profile profile="$ctrl.profile"></profile>',
        resolve: {
          resGetProfile : 'resGetProfile'
        },
        controller: function( resGetProfile, $stateParams){
          this.profile = {};
          for (var i = 0, l = resGetProfile.data.length; i <l;i++) {
            if (resGetProfile.data[i].firstName == $stateParams.pid) {
              console.log(resGetProfile.data[i])
              this.profile = resGetProfile.data[i];
              break;
            }
          }
        },
        controllerAs : '$ctrl'
      })
      .state('mail', {
        parent: 'common',
        url : 'mail',
        template: '<mail></mail>',
      })
        .state('inbox', {
          parent: 'mail',
          url : '/inbox/:eid',
          template: '<inbox emails="$ctrl.emails" content="$ctrl.content"</inbox>',
          resolve: {
            resGetEmails : 'resGetEmails',
            emailsCacheService : 'emailsCacheService'
          },
          controller: function( resGetEmails, $stateParams, emailsCacheService){
            this.emails = resGetEmails.data.filter(function(m){return m.box == 'inbox'});
            this.emails.sort(function(a,b){return a.date>b.date});
            this.content = null;
            var self = this;
            if ($stateParams.eid) {
              this.content = 'lodaing';
              emailsCacheService.getMailOnId().then(function(res) {self.content = res});
            }
          },
          controllerAs : '$ctrl'
        })
        .state('outbox', {
          parent: 'mail',
          url : '/outbox',
          template: '<outbox></outbox>'
        })
    .state('erorr404', {
      url : '/error404',
      template: '<error id="404"></error>'
    })
    .state('login', {
      url : '/login',
      template: '<login></login>'
    })
})
.factory('resGetContacts', function($http) {
  this.res = $http.get("api/contacts.json").then(function(res){return res});
  return  this.res ;
})
.factory('resGetProfile', function($http, $stateParams) {
  var res = $http({
    url: "api/contacts.json",
    method: 'GET',
    params: {
      name: $stateParams.pid
    }
  }).then(function(res) {
    return res;
  });
  return res
})
.factory('resGetEmails', function($http, $stateParams) {
  var res = $http({
    url: "api/mail.json",
    method: 'GET',
    params: {
      // name: $stateParams.pid
    }
  }).then(function(res) {
    return res;
  });
  return res
})
.factory('emailsCacheService', function($http,$stateParams) {
  var cache = {};
  var getMailOnId = function() {
    var id = $stateParams.eid;
    if (cache[id]) {
      return cache[id];
    }
    else {
      cache[id] = $http({
        url: "api/mail.json",
        method: 'GET',
        params: {
          name: id
        }
      }).then(function(res) {
        return  res.data.filter(function(m){return m.key == id})[0]; 
      });
      return cache[id];
    }
  }

  return {getMailOnId:getMailOnId};
})
.run(function ($rootScope, AUTH_EVENTS, AuthService, $state) {
  $rootScope.$on('$stateChangeStart', function (event, next) {
    if (next.data && next.data.authorizedRoles) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        if (AuthService.isAuthenticated()) {
          // user is not allowed
          $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
        } else {
          // user is not logged in
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        }
      }
    }
  });
  $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
    $state.go('common')
  }) 
  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
    $state.go('login')
  }) 
})
.component('common', {
  templateUrl: 'app/components/common/common.html',
  controller: function(){},
  bindings: {
  }
})
.component('mail', {
  templateUrl: 'app/components/content-mail/content-mail.html',
  controller: function(){},
  bindings: {
  }
})
.component('inbox', {
  templateUrl: 'app/components/content-mail-inbox/content-mail-inbox.html',
  controller: function(dateService){
    this.shortDate = dateService.shortDate;
  },
  bindings: {
    emails: '<',
    content : '<'
  }
})
.component('mailContent', {
  templateUrl: 'app/components/content-mail-email/content-mail-email.html',
  controller: function(){
  },
  bindings: {
    content : '<'
  }
})
.component('outbox', {
  templateUrl: 'app/components/content-mail-outbox/content-mail-outbox.html',
  controller: function(){},
  bindings: {
  }
})
.component('contacts', {
  templateUrl: 'app/components/content-contacts/content-contacts.html',
  controller: function(resGetContacts){
  },
  controllerAs : '$ctrl',
  bindings: {
    contacts : '<'
  }
})
.component('contact', {
  templateUrl: 'app/components/content-contacts-contact/content-contacts-contact.html',
  controller: function(){
    this.getNumber = function(num) {
        return new Array(num);   
    }
  },
  bindings: {
    contact : '<'
  }
})
.component('profile', {
  templateUrl: 'app/components/profile/profile.html',
  controller: function(){

    this.skills = ['Str','Dex','Con','Int','Wis','Cha'];
    this.getSkill = function(key) {
      console.log(key)
      console.log(Math.round(this.profile.skills[this.skills.indexOf(key)] / 20 * 100))
      return Math.round(this.profile.skills[this.skills.indexOf(key)] / 20 * 100);
    }
  },
  bindings: {
    profile : '<'
  }
})
.component('sidebar', {
  templateUrl: 'app/components/sidebar/sidebar.html',
  controller: function( $state){
    this.selectedItem = '';
    this.showChildMenu = function(item) {
      return  this.selectedItem == item; 
    }
    this.selectItem = function(item) {
      this.selectedItem = this.selectedItem == item ? '' : item;
    }
    this.itemClass = function(item) {
      return $state.includes(item) ? 'active' : '' ;
    }
  },
  controllerAs: '$ctrl',
  bindings: {
  }
})
.component('topNavigation', {
  templateUrl: 'app/components/top-navigation/top-navigation.html',
  controller: function(){
    this.userDropdownIsOpen = false;
    this.userDropdownToggle = function() {
      this.userDropdownIsOpen = !this.userDropdownIsOpen;
    };
    this.userDropdownClass = function() {
      return this.userDropdownIsOpen ? 'open' : '';
    }
  },
  controllerAs : '$ctrl',
  bindings: {
  }
})

.component('error', {
  templateUrl: 'app/components/error-404/error-404.html',
  controller: function(){},
  bindings: {
  }
})
.component('login', {
  templateUrl: 'app/components/login/login.html',
  controller: function(AuthService, $rootScope, AUTH_EVENTS){
    this.credential = {
      username: 'Username',
      password: 'Password'
    }
    this.logIn = function(credential) {
      AuthService.logIn(credential).then( function() {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess)
      } , function() {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed)
      })
    }
  },
  bindings: {
  }
})
.factory('AuthService', function($http, Session) {
  return {
    logIn: function(credential) {
      return $http
        .get('api/autorization.txt', credential)
        .then(function(res) {
          var resArr = res.data.split(':');
          Session.create(credential.username, resArr[0], resArr[1], resArr[2]);
        }, function(res) {
        })
    },
    isAuthenticated: function() {
      return !!Session.userId;
    },
    isAuthorized: function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (this.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1)
    }
  }
})
.factory('Session', function() {
  return {
    id: null,
    userId: null,
    userName: null,
    userRole: '*',
    create: function(userName, sessionId, userId, userRole) {
      this.userName = userName;
      this.id = sessionId;
      this.userId = userId;
      this.userRole = userRole;
    },
    destroy: function() {
      this.userName = null;
      this.id = null;
      this.userId = null;
      this.userRole = '*';
    }
  }
})
.factory('dateService', function() {
  return {
    shortDate: function(date) {
      var d = new Date(); d.setTime(date);
      var day = d.getDay();
      if (day < 10) day = '0'+day;
      var mon = d.getMonth();
      if (mon < 10) mon = '0'+mon;
      var year = d.getFullYear()+'';
      return day+'.'+mon+'.'+year.substr(-2);
    }
  }
})
.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  editor: 'editor',
  guest: 'guest'
})
.controller('ApplicationController', function ($scope,
                                               USER_ROLES,
                                               AuthService,
                                               Session) {
  $scope.session = Session;
  $scope.userRoles = USER_ROLES;
  $scope.isAuthorized = AuthService.isAuthorized;

})
.directive('appLogic', function() {
  return {
    restrict: 'A',
    controller: 'ApplicationController'  
  }
})
.directive('appInterface', function() {
  var gamburgerIsColapsed = false;
  return {
    restrict: 'A',
    controller: function($scope) {
      $scope.boorgerToogle = function() {
        gamburgerIsColapsed = !gamburgerIsColapsed;
      }
      $scope.bodyClass = function() {
        return gamburgerIsColapsed ? 'nav-sm' : 'nav-md';
      }
    },
    // controllerAs : 'appInterface'
  }
})
/**
Для того, то бы иметь доступ кобъекту сесси я сделал директиву appLogic с контроллером содержащим этот объект сессии. После чего эту директиву я добавляю ко все компонентам где наобходимы данные о сессии. А в директиву упаковал, что была возмоность подключить несколько контроллеров к одному компоененту.
$rootScope не использовал специально.
Оцените, пожалуйста, подход.
**/