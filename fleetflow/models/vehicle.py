from odoo import models, fields


class FleetFlowVehicle(models.Model):
    _name = 'fleetflow.vehicle'
    _description = 'FleetFlow Vehicle'

    name = fields.Char(string='Name', required=True)
    license_plate = fields.Char(string='License Plate', required=True)
    max_capacity = fields.Float(string='Max Capacity')
    status = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('maintenance', 'Maintenance'),
    ], string='Status', default='available')
