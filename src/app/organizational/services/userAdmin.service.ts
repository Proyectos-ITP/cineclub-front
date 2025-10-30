/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SnackBarService } from '../../shared/services/snackBar.service';
import { supabase } from '../../supabaseClient';

export interface UserSearchParams {
  search?: string;
  roleType?: string;
  country?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  private readonly supabase: SupabaseClient = supabase;
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  async getUsers(page: number = 1, limit: number = 10, params: UserSearchParams = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = this.supabase
        .from('profile')
        .select(
          `
          id,
          fullName,
          email,
          country,
          phone,
          username,
          created_at,
          roleTypeId,
          roleType:roleType!fk_profile_roletype (
            id,
            code,
            name
          )
          `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, to);

      if (params.search && params.search.trim() !== '') {
        query = query.or(
          `fullName.ilike.%${params.search}%,email.ilike.%${params.search}%,username.ilike.%${params.search}%`
        );
      }

      if (params.roleType && params.roleType.trim() !== '') {
        query = query.eq('roleTypeId', params.roleType);
      }

      if (params.country && params.country.trim() !== '') {
        query = query.eq('country', params.country);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      const transformedData = data?.map((user) => ({
        ...user,
        roleType: Array.isArray(user.roleType) ? user.roleType[0] : user.roleType,
      }));

      return { data: transformedData, count };
    } catch (error: any) {
      console.error('❌ Error al obtener usuarios:', error.message);
      this._snackBarService.error('No se pudieron cargar los usuarios.');
      throw error;
    }
  }

  async getRoleTypes() {
    try {
      const { data, error } = await this.supabase
        .from('roleType')
        .select('id, code, name')
        .order('name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('❌ Error al obtener roles:', error.message);
      this._snackBarService.error('No se pudieron cargar los roles.');
      throw error;
    }
  }
}
