import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { sellerGuard } from './guards/seller.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadComponent: () => import('./features/home/home-page.component').then(m => m.HomePageComponent) },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products-list.component').then((m) => m.ProductsListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-details.component').then((m) => m.ProductDetailsComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart-page.component').then((m) => m.CartPageComponent)
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout-page.component').then((m) => m.CheckoutPageComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders-page.component').then((m) => m.OrdersPageComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./features/wishlist/wishlist-page.component').then((m) => m.WishlistPageComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup-page.component').then((m) => m.SignupPageComponent)
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/account-page.component').then((m) => m.AccountPageComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/admin-products.component').then((m) => m.AdminProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/admin-categories.component').then((m) => m.AdminCategoriesComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/admin-users.component').then((m) => m.AdminUsersComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/admin-orders.component').then((m) => m.AdminOrdersComponent)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/admin/admin-analytics.component').then((m) => m.AdminAnalyticsComponent)
      }
    ]
  },
  {
    path: 'seller',
    canActivate: [sellerGuard],
    loadComponent: () =>
      import('./features/seller/seller-dashboard.component').then((m) => m.SellerDashboardComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/admin-products.component').then((m) => m.AdminProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/admin-categories.component').then((m) => m.AdminCategoriesComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/admin-users.component').then((m) => m.AdminUsersComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/admin-orders.component').then((m) => m.AdminOrdersComponent)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/admin/admin-analytics.component').then((m) => m.AdminAnalyticsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'products' }
];
