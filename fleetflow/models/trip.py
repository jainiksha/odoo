from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class FleetFlowTrip(models.Model):
    _name = 'fleetflow.trip'
    _description = 'FleetFlow Trip'

    name = fields.Char(string='Name', required=True)
    vehicle_id = fields.Many2one('fleetflow.vehicle', string='Vehicle')
    driver_id = fields.Many2one('fleetflow.driver', string='Driver')
    cargo_weight = fields.Float(string='Cargo Weight')
    status = fields.Selection([
        ('draft', 'Draft'),
        ('completed', 'Completed'),
    ], string='Status', default='draft')

    @api.constrains('cargo_weight', 'vehicle_id')
    def _check_cargo_weight(self):
        for rec in self:
            if rec.vehicle_id and rec.cargo_weight > rec.vehicle_id.max_capacity:
                raise ValidationError(
                    _('Cargo weight cannot exceed vehicle max capacity of %s.') % rec.vehicle_id.max_capacity
                )
