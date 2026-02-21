from odoo import models, fields


class FleetFlowDriver(models.Model):
    _name = 'fleetflow.driver'
    _description = 'FleetFlow Driver'

    name = fields.Char(string='Name', required=True)
    license_number = fields.Char(string='License Number')
    license_expiry = fields.Date(string='License Expiry')
    status = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('suspended', 'Suspended'),
    ], string='Status', default='available')
