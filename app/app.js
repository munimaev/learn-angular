angular.module('myapp', ['ui.router'])
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  // $locationProvider.hashPrefix('')
  // $locationProvider.html5Mode('true')
  $urlRouterProvider.otherwise('error404');

  $stateProvider
    .state('common', {
      url : '',
      template: '<common></common>'
    })
      .state('contacts', {
        parent: 'common',
        url : '/contacts',
        template: '<contacts></contacts>',
      })
      .state('mail', {
        parent: 'common',
        url : '/mail',
        template: '<mail></mail>',
      })
        .state('inbox', {
          parent: 'mail',
          url : '/inbox',
          template: '<inbox></inbox>'
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
  controller: function(){},
  bindings: {
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
  controller: function(){},
  bindings: {
  }
})
.component('sidebar', {
  templateUrl: 'app/components/sidebar/sidebar.html',
  controller: function(){},
  bindings: {
  }
})
.component('topNavigation', {
  templateUrl: 'app/components/top-navigation/top-navigation.html',
  controller: function(){},
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
  controller: function(){},
  bindings: {
  }
})
