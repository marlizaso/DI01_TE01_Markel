
import { Component, signal, computed, inject } from '@angular/core';
import restaurantesJSON from '../../assets/datos/restaurantes.json';
import { IonicModule, ToastController } from '@ionic/angular';
import { Restaurante } from '../interface/restaurante';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  // ############################### REGION DATOS ###############################

  // Inyectamos el controlador de toasts
  private toastController = inject(ToastController);

  // Lista completa de restaurantes leída del JSON
  restaurantes: Restaurante[] = restaurantesJSON as Restaurante[];

  // Signal con los restaurantes cargados
  restaurantesCargados = signal<Restaurante[]>([]);

  // Comprueba si hay restaurantes cargados
  hayDatos = computed(() => this.restaurantesCargados().length > 0);

  // Carga los datos y muestra un toast
  async cargarDatos() {
    this.restaurantesCargados.set(this.restaurantes);

    await this.mostrarToast(
      `${this.restaurantesCargados().length} restaurantes cargados`,
      'success'
    );
  }

  // Muestra un toast con el mensaje y el color indicados
  private async mostrarToast(
    mensaje: string,
    color: 'success' | 'danger' | 'warning'
  ) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });

    await toast.present();
  }

  // ############################### REGION FILTROS ###############################

  // Texto introducido en el buscador
  textoBusqueda = signal('');

  // ############################### REGION TERRITORIOS ###############################

  // Territorio seleccionado
  territorioSeleccionado = signal('');

  // Lista de territorios únicos y ordenados alfabéticamente
  territoriosFiltrados = computed(() => {
    const territorios = this.restaurantesCargados()
      .map(r => r.territory?.trim())
      .filter((territorio): territorio is string => !!territorio);

    return Array.from(new Set(territorios)).sort();
  });

  // Actualiza el territorio y conserva solo las localidades válidas
  onTerritorioChange(value: string) {
    this.territorioSeleccionado.set(value ?? '');

    const localidadesValidas = this.localidadesFiltradasPorTerritorio();

    const seleccionadas = this.localidadesSeleccionadas()
      .filter(localidad => localidadesValidas.includes(localidad));

    this.localidadesSeleccionadas.set(seleccionadas);
  }

  // ############################### REGION LOCALIDADES ###############################

  // Localidades seleccionadas
  localidadesSeleccionadas = signal<string[]>([]);

  // Localidades únicas del territorio seleccionado
  localidadesFiltradasPorTerritorio = computed(() => {
    let lista: Restaurante[] = this.restaurantesCargados();

    const territorio = this.territorioSeleccionado()
      .trim()
      .toLowerCase();

    if (territorio) {
      lista = lista.filter(r =>
        r.territory?.trim().toLowerCase() === territorio
      );
    }

    const localidades = lista
      .filter(r => !!r.locality?.trim())
      .map(r => r.locality!.trim());

    return Array.from(new Set(localidades)).sort();
  });

  // Actualiza las localidades seleccionadas
  onLocalidadesChange(value: string[]) {
    this.localidadesSeleccionadas.set(value ?? []);
  }

  // ############################### REGION RESULTADOS ###############################

  // Lista de restaurantes filtrados según los tres filtros
  restaurantesFiltrados = computed(() => {
    let lista = this.restaurantesCargados();

    const busqueda = this.textoBusqueda()
      .trim()
      .toLowerCase();

    const territorio = this.territorioSeleccionado()
      .trim()
      .toLowerCase();

    const localidades = this.localidadesSeleccionadas();

    lista = lista.filter(r => {

      // Filtro por nombre
      const nombre = String(r.documentName ?? '').toLowerCase();
      const coincideBusqueda = nombre.includes(busqueda);

      // Filtro por territorio
      const territorioRestaurante =
        String(r.territory ?? '').trim().toLowerCase();

      const coincideTerritorio =
        !territorio || territorioRestaurante === territorio;

      // Filtro por localidad
      const localidad = String(r.locality ?? '').trim();

      const coincideLocalidad =
        localidades.length === 0 || localidades.includes(localidad);

      return coincideBusqueda &&
        coincideTerritorio &&
        coincideLocalidad;
    });

    return lista;
  });

  // ############################### REGION AUXILIARES ###############################

  // Comprueba si hay filtros activos
  hayFiltrosActivos(): boolean {
    return this.textoBusqueda().trim() !== ''
      || this.territorioSeleccionado() !== ''
      || this.localidadesSeleccionadas().length > 0;
  }

  // Limpia todos los filtros
  limpiarTodosFiltros(): void {
    this.textoBusqueda.set('');
    this.territorioSeleccionado.set('');
    this.localidadesSeleccionadas.set([]);
  }

  // Devuelve el número de estrellas Michelin
  estrellasMichelin(restaurante: Restaurante): number {
    const valor = Number(restaurante.michelinStar);
    return Number.isFinite(valor) ? valor : 0;
  }

  // Devuelve el número de soles Repsol
  repsolSoles(restaurante: Restaurante): number {
    const valor = Number(restaurante.repsolSun);
    return Number.isFinite(valor) ? valor : 0;
  }
}
